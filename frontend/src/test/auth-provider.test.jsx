import { vi, beforeEach, test, expect } from "vitest";
import { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import AuthProvider from "../context/AuthProvider";
import AuthContext from "../context/AuthContext";
import PrivateRoute from "../utils/PrivateRoute";
import * as api from "../api/auth";
vi.mock("../api/auth", () => ({
  checkAuthApi: vi.fn(),
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  confirmEmailCodeApi: vi.fn(),
  resendVerificationApi: vi.fn(),
  sendResetPasswordLinkApi: vi.fn(),
  resetPasswordApi: vi.fn(),
  updateUserApi: vi.fn(),
  requestEmailChangeApi: vi.fn(),
  confirmEmailChangeApi: vi.fn(),
  logoutApi: vi.fn(),
  changePasswordApi: vi.fn(),
  deleteAccountApi: vi.fn(),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
const user = {
  _id: "user-1",
  name: "Test",
  email: "test@example.com",
  isVerified: true,
};
function Harness() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  if (auth.loading) return <p>Loading session</p>;
  return (
    <>
      <p data-testid="location">{location.pathname}</p>
      <p data-testid="user">{auth.user?.email || "anonymous"}</p>
      <button
        onClick={() =>
          auth.login({ email: user.email, password: "test-password" })
        }
      >
        Login
      </button>
      <button onClick={() => auth.confirmEmail(user.email, "123456")}>
        Verify
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
    </>
  );
}
const mount = (path = "/login") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Harness />
      </AuthProvider>
    </MemoryRouter>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  api.checkAuthApi.mockRejectedValue(new Error("not signed in"));
});
test("initial cookie session is restored without any localStorage metadata", async () => {
  api.checkAuthApi.mockResolvedValue({ success: true, user });
  mount("/profile");
  expect(await screen.findByText(user.email)).toBeInTheDocument();
  expect(screen.getByTestId("location")).toHaveTextContent("/profile");
  expect(api.checkAuthApi).toHaveBeenCalledTimes(1);
});
test("an anonymous reset link stays accessible while the initial check fails", async () => {
  mount("/reset-password/token");
  expect(await screen.findByText("anonymous")).toBeInTheDocument();
  expect(screen.getByTestId("location")).toHaveTextContent(
    "/reset-password/token",
  );
});
test("login and verification update user before entering dashboard; logout clears it", async () => {
  api.loginApi.mockResolvedValue({ success: true, user });
  api.logoutApi.mockResolvedValue({ success: true });
  api.confirmEmailCodeApi.mockResolvedValue({ success: true, user });
  mount();
  await screen.findByText("anonymous");
  const browser = userEvent.setup();
  await browser.click(screen.getByText("Login"));
  await waitFor(() =>
    expect(screen.getByTestId("user")).toHaveTextContent(user.email),
  );
  expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  await browser.click(screen.getByText("Logout"));
  await waitFor(() =>
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous"),
  );
  expect(screen.getByTestId("location")).toHaveTextContent("/login");
  await browser.click(screen.getByText("Verify"));
  await waitFor(() =>
    expect(screen.getByTestId("user")).toHaveTextContent(user.email),
  );
  expect(api.confirmEmailCodeApi).toHaveBeenCalledWith(user.email, "123456");
});
test("unverified login leads to the verification page rather than protected content", async () => {
  api.loginApi.mockRejectedValue({
    response: {
      data: { message: "Verify your email", code: "VERIFICATION_REQUIRED" },
    },
  });
  mount();
  await screen.findByText("anonymous");
  await userEvent.click(screen.getByText("Login"));
  await waitFor(() =>
    expect(screen.getByTestId("location")).toHaveTextContent("/confirm-email"),
  );
  expect(sessionStorage.getItem("verificationEmail")).toBe(user.email);
});
test("private routes reject anonymous and unverified users", async () => {
  for (const value of [null, { ...user, isVerified: false }]) {
    const view = render(
      <MemoryRouter initialEntries={["/private"]}>
        <AuthContext.Provider value={{ user: value, loading: false }}>
          <Routes>
            <Route
              path="/private"
              element={
                <PrivateRoute>
                  <p>Protected content</p>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<p>Sign in first</p>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Sign in first")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    view.unmount();
  }
});
