import { beforeEach, expect, test, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Documentation from "../pages/documentation/Documentation";
import CodeBlock from "../pages/documentation/CodeBlock";
import {
  getHeadings,
  guides,
  headingId,
  searchGuides,
} from "../pages/documentation/guides";

vi.mock("../layouts/DashboardLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
const mount = (path = "/documentation") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/documentation/:slug?" element={<Documentation />} />
      </Routes>
    </MemoryRouter>,
  );

test("overview renders all guide navigation and an actual article heading target", () => {
  mount();
  expect(
    screen.getByRole("heading", { name: "Project overview", level: 1 }),
  ).toBeInTheDocument();
  const nav = screen.getByRole("complementary", {
    name: "Documentation guides",
  });
  expect(
    within(nav).getByRole("link", { name: "Environment configuration" }),
  ).toHaveAttribute("href", "/documentation/configuration");
  expect(document.getElementById("doc-what-you-can-do")).toHaveTextContent(
    "What you can do",
  );
  expect(guides).toHaveLength(10);
});

test("guide links change the route, title and Markdown content", async () => {
  const browser = userEvent.setup();
  mount();
  await browser.click(
    within(
      screen.getByRole("complementary", { name: "Documentation guides" }),
    ).getByRole("link", { name: "Getting started" }),
  );
  expect(
    await screen.findByRole("heading", { name: "Getting started", level: 1 }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Start the backend" }),
  ).toBeInTheDocument();
  expect(document.querySelector(".hljs-keyword, .hljs-comment")).not.toBeNull();
  expect(
    screen.getByRole("link", { name: /Next guide.*Environment configuration/ }),
  ).toHaveAttribute("href", "/documentation/configuration");
});

test("search finds code variables and supports keyboard selection and shortcut", async () => {
  const browser = userEvent.setup();
  mount();
  const input = screen.getByRole("combobox", { name: "Search documentation" });
  await browser.keyboard("{Control>}k{/Control}");
  expect(input).toHaveFocus();
  await browser.type(input, "JWT_REFRESH_SECRET");
  expect(
    screen.getByRole("listbox", { name: "Documentation search results" }),
  ).toBeInTheDocument();
  await browser.keyboard("{Enter}");
  expect(
    await screen.findByRole("heading", {
      name: "Environment configuration",
      level: 1,
    }),
  ).toBeInTheDocument();
  expect(input).toHaveValue("");
  await browser.type(input, "nothing-matches-this-query");
  expect(screen.getByText("No matching guides")).toBeInTheDocument();
  await browser.keyboard("{Escape}");
  expect(input).toHaveValue("");
});

test("mobile guide select works and unknown slugs have a recoverable not-found state", async () => {
  const browser = userEvent.setup();
  mount("/documentation/unknown-guide");
  expect(
    screen.getByRole("heading", { name: "Guide not found" }),
  ).toBeInTheDocument();
  await browser.selectOptions(
    screen.getByLabelText("Browse guides"),
    "troubleshooting",
  );
  expect(
    await screen.findByRole("heading", { name: "Troubleshooting", level: 1 }),
  ).toBeInTheDocument();
});

test("copy uses plain text from highlighted code and reports clipboard failure", async () => {
  const browser = userEvent.setup();
  const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  render(
    <CodeBlock>
      <code className="language-javascript">
        <span>const</span>
        {" answer = "}
        <span>42</span>
        {";\n"}
      </code>
    </CodeBlock>,
  );
  await browser.click(screen.getByRole("button", { name: "Copy code" }));
  expect(copy).toHaveBeenCalledWith("const answer = 42;");
  expect(
    screen.getByRole("button", { name: "Code copied" }),
  ).toBeInTheDocument();
  copy.mockRejectedValue(new Error("Permission denied"));
  await browser.click(screen.getByRole("button", { name: "Code copied" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Copy unavailable",
  );
});

test("download creates a Markdown file for the selected article", async () => {
  const browser = userEvent.setup();
  const createUrl = vi.fn(() => "blob:test-guide");
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createUrl,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  let filename;
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
    function () {
      filename = this.download;
    },
  );
  mount("/documentation/configuration");
  await browser.click(screen.getByRole("button", { name: "Download .md" }));
  await waitFor(() => expect(createUrl).toHaveBeenCalledWith(expect.any(Blob)));
  expect(filename).toBe("data-app-configuration.md");
});

test("each guide has unique section IDs and required topics are searchable", () => {
  for (const guide of guides) {
    const ids = getHeadings(guide.content).map((heading) => heading.id);
    expect(ids.length).toBeGreaterThan(2);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.startsWith("doc-"))).toBe(true);
  }
  expect(headingId("Origins and cookies")).toBe("doc-origins-and-cookies");
  expect(searchGuides("IP Access List").map((guide) => guide.id)).toContain(
    "troubleshooting",
  );
  expect(searchGuides("   ")).toEqual([]);
});
