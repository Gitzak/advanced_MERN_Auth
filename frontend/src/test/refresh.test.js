import { test, expect, vi } from "vitest";
import { AxiosError } from "axios";
import api from "../api/axiosInstance";
const response = (config, data = { success: true }) => ({
  config,
  data,
  status: 200,
  statusText: "OK",
  headers: {},
});
const unauthorized = (config) =>
  new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
    status: 401,
    data: { message: "Unauthorized" },
    headers: {},
    config,
  });
test("concurrent protected requests share one refresh and retry once", async () => {
  let renew;
  let refreshCount = 0;
  api.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh-token") {
      refreshCount++;
      await new Promise((resolve) => {
        renew = resolve;
      });
      return response(config);
    }
    if (!config._retried) throw unauthorized(config);
    return response(config, { success: true, user: { name: "Test" } });
  };
  const first = api.get("/auth/me");
  const second = api.put("/auth/update-profile", { name: "Test" });
  await vi.waitFor(() => expect(refreshCount).toBe(1));
  renew();
  expect(
    (await Promise.all([first, second])).every((r) => r.status === 200),
  ).toBe(true);
  expect(refreshCount).toBe(1);
});
test("invalid login never triggers refresh", async () => {
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    throw unauthorized(config);
  };
  await expect(
    api.post("/auth/login", { email: "x", password: "bad" }),
  ).rejects.toMatchObject({ response: { status: 401 } });
  expect(calls).toBe(1);
});
test("failed refresh expires auth and never loops", async () => {
  const expired = vi.fn();
  window.addEventListener("auth-expired", expired);
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    throw unauthorized(config);
  };
  await expect(api.get("/auth/check-auth")).rejects.toMatchObject({
    response: { status: 401 },
  });
  expect(calls).toBe(2);
  expect(expired).toHaveBeenCalledTimes(1);
  window.removeEventListener("auth-expired", expired);
});

test("a second tab rechecks cookies under a shared lock before rotating again", async () => {
  let refreshCount = 0;
  const requestLock = vi.fn(async (_name, callback) => callback());
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request: requestLock },
  });
  api.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh-token") refreshCount++;
    if (!config._retried) throw unauthorized(config);
    return response(config);
  };
  try {
    expect((await api.get("/auth/me")).status).toBe(200);
    expect(requestLock).toHaveBeenCalledTimes(1);
    expect(refreshCount).toBe(0);
  } finally {
    delete navigator.locks;
  }
});
