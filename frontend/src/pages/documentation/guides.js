import overview from "./content/overview.md?raw";
import gettingStarted from "./content/getting-started.md?raw";
import configuration from "./content/configuration.md?raw";
import authentication from "./content/authentication.md?raw";
import routing from "./content/routing.md?raw";
import apiReference from "./content/api-reference.md?raw";
import architecture from "./content/architecture.md?raw";
import emailDelivery from "./content/email-delivery.md?raw";
import testing from "./content/testing.md?raw";
import troubleshooting from "./content/troubleshooting.md?raw";

export const guideGroups = [
  "Start here",
  "Build and integrate",
  "Operate and maintain",
];
export const guides = [
  {
    id: "overview",
    title: "Project overview",
    description:
      "Meet Data App. Understand what it does, how the stack fits together, and where to start.",
    group: "Start here",
    content: overview,
  },
  {
    id: "getting-started",
    title: "Getting started",
    description:
      "From a fresh checkout to your first verified account. Run the API and frontend locally.",
    group: "Start here",
    content: gettingStarted,
  },
  {
    id: "configuration",
    title: "Environment configuration",
    description:
      "Set up MongoDB, SMTP, origins and token lifetimes with safe, copyable examples.",
    group: "Start here",
    content: configuration,
  },
  {
    id: "authentication",
    title: "Authentication and sessions",
    description:
      "Follow the account lifecycle, from verification codes to rotating and revoking sessions.",
    group: "Build and integrate",
    content: authentication,
  },
  {
    id: "api-reference",
    title: "API reference",
    description:
      "Request contracts, response shapes and HTTP statuses for every registered endpoint.",
    group: "Build and integrate",
    content: apiReference,
  },
  {
    id: "routing",
    title: "Routes and redirects",
    description:
      "Understand page access, session guards and the destinations of account actions.",
    group: "Build and integrate",
    content: routing,
  },
  {
    id: "architecture",
    title: "Project architecture",
    description:
      "Explore the source boundaries, data models, permissions and extension points.",
    group: "Build and integrate",
    content: architecture,
  },
  {
    id: "email-delivery",
    title: "Email delivery",
    description:
      "Configure Mailtrap Sandbox and understand persisted jobs, retries and delivery states.",
    group: "Operate and maintain",
    content: emailDelivery,
  },
  {
    id: "testing",
    title: "Testing and validation",
    description:
      "Run isolated tests and check the behaviors that a successful build cannot prove.",
    group: "Operate and maintain",
    content: testing,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description:
      "Find practical checks for login errors, Atlas access, cookies and missing emails.",
    group: "Operate and maintain",
    content: troubleshooting,
  },
];
export const guidePath = (id) =>
  id === "overview" ? "/documentation" : `/documentation/${id}`;
export const headingId = (title) =>
  "doc-" +
  title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-");
export const getHeadings = (content) =>
  [...content.matchAll(/^## (.+)$/gm)].map((match) => ({
    title: match[1],
    id: headingId(match[1]),
  }));

export function searchGuides(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return guides
    .map((guide) => {
      const haystack =
        `${guide.title} ${guide.description} ${guide.content}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return null;
      const plain = guide.content
        .replace(/[#>*_|`[\]]/g, "")
        .replace(/\s+/g, " ");
      const index = Math.max(0, plain.toLowerCase().indexOf(terms[0]) - 45);
      const score = terms.reduce(
        (sum, term) => sum + (guide.title.toLowerCase().includes(term) ? 3 : 0),
        0,
      );
      return {
        ...guide,
        snippet: (index ? "…" : "") + plain.slice(index, index + 140) + "…",
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
