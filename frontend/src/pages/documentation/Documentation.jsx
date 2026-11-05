import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import powershell from "highlight.js/lib/languages/powershell";
import ini from "highlight.js/lib/languages/ini";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  KeyRound,
  LifeBuoy,
  Rocket,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getHeadings, guideGroups, guidePath, guides } from "./guides";
import CodeBlock from "./CodeBlock";
import DocumentationSearch from "./DocumentationSearch";
import "./documentation.css";

function Heading({ as: Tag, id, children }) {
  return (
    <Tag id={id} aria-labelledby={`${id}-label`}>
      <a
        href={`#${id}`}
        className="docs-heading-anchor"
        aria-label="Link to this section"
      >
        #
      </a>
      <span id={`${id}-label`}>{children}</span>
    </Tag>
  );
}
const markdownComponents = {
  pre: CodeBlock,
  h2: ({ id, children }) => (
    <Heading as="h2" id={id}>
      {children}
    </Heading>
  ),
  h3: ({ id, children }) => (
    <Heading as="h3" id={id}>
      {children}
    </Heading>
  ),
  table: ({ children }) => (
    <div
      className="docs-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Scrollable reference table"
    >
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) =>
    href?.startsWith("/") ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a
        href={href}
        {...(href?.startsWith("https://")
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
      >
        {children}
      </a>
    ),
};
const highlightOptions = {
  ignoreMissing: true,
  languages: { powershell, dotenv: ini },
};

export default function Documentation() {
  const { slug = "overview" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const guide = guides.find((item) => item.id === slug);
  const headings = useMemo(() => getHeadings(guide?.content || ""), [guide]);
  const [activeHeading, setActiveHeading] = useState("");
  const [downloadError, setDownloadError] = useState(false);
  const title = useRef(null);
  useEffect(() => {
    if (location.hash) {
      let target = location.hash.slice(1);
      try {
        target = decodeURIComponent(target);
      } catch {
        /* Keep malformed fragments harmless. */
      }
      document.getElementById(target)?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      title.current?.focus({ preventScroll: true });
    }
  }, [slug, location.hash]);
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: "-24px 0px -65% 0px" },
    );
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [headings]);
  const currentIndex = guides.findIndex((item) => item.id === slug);
  const previous = guides[currentIndex - 1];
  const next = guide ? guides[currentIndex + 1] : null;
  const minutes = Math.max(
    2,
    Math.ceil((guide?.content.split(/\s+/).length || 0) / 220),
  );
  const download = () => {
    try {
      const blob = new Blob(
        [`# ${guide.title}\n\n${guide.description}\n\n${guide.content}`],
        { type: "text/markdown;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `data-app-${guide.id}.md`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError(false);
    } catch {
      setDownloadError(true);
    }
  };
  return (
    <>
      <title>Documentation — Data App</title>
      <DashboardLayout flush>
        <div className="docs-frame">
          <header className="docs-topbar">
            <Link to="/documentation" className="docs-brand">
              <span className="docs-brand-icon">
                <BookOpen size={20} />
              </span>
              <span>
                Documentation<small>Data App developer hub</small>
              </span>
            </Link>
            <DocumentationSearch />
          </header>
          <div className="docs-mobile-nav">
            <label htmlFor="documentation-guide">Browse guides</label>
            <select
              id="documentation-guide"
              value={guide?.id || ""}
              onChange={(event) => navigate(guidePath(event.target.value))}
            >
              {!guide && <option value="">Choose a guide</option>}
              {guideGroups.map((group) => (
                <optgroup label={group} key={group}>
                  {guides
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="docs-grid">
            <aside className="docs-guide-nav" aria-label="Documentation guides">
              <div className="docs-nav-label">
                THE HANDBOOK <span>{guides.length} guides</span>
              </div>
              {guideGroups.map((group) => (
                <div className="docs-nav-group" key={group}>
                  <h2>{group}</h2>
                  {guides
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <NavLink
                        end
                        to={guidePath(item.id)}
                        key={item.id}
                        className={({ isActive }) =>
                          isActive ? "is-active" : ""
                        }
                      >
                        {item.id === "overview" ? (
                          <BookOpen size={15} />
                        ) : item.id === "api-reference" ? (
                          <Code2 size={15} />
                        ) : (
                          <FileText size={15} />
                        )}
                        <span>{item.title}</span>
                      </NavLink>
                    ))}
                </div>
              ))}
              <Link
                to="/documentation/troubleshooting"
                className="docs-help-card"
              >
                <LifeBuoy size={20} />
                <strong>Something not working?</strong>
                <span>Start with the troubleshooting guide.</span>
                <span className="docs-help-cta">
                  Find a solution <ArrowRight size={13} />
                </span>
              </Link>
            </aside>
            {guide ? (
              <article className="docs-article">
                <div className="docs-breadcrumb">
                  <Link to="/documentation">Documentation</Link>
                  <ChevronRight size={13} />
                  <span>{guide.group}</span>
                </div>
                <div className="docs-article-meta">
                  <span className="docs-category">PROJECT GUIDE</span>
                  <span>
                    <Clock3 size={13} /> {minutes} min read
                  </span>
                </div>
                <h1 ref={title} tabIndex={-1}>
                  {guide.title}
                </h1>
                <p className="docs-description">{guide.description}</p>
                <div className="docs-article-tools">
                  <span>
                    <Check size={14} /> Based on the project source
                  </span>
                  <button type="button" onClick={download}>
                    <ArrowDownToLine size={14} /> Download .md
                  </button>
                </div>
                {downloadError && (
                  <p className="docs-download-error" role="status">
                    Download unavailable in this browser. The Markdown sources
                    are in src/pages/documentation/content.
                  </p>
                )}
                {guide.id === "overview" && (
                  <div className="docs-quicklinks">
                    <Link to="/documentation/getting-started">
                      <span className="docs-quick-icon">
                        <Rocket size={21} />
                      </span>
                      <strong>Run it locally</strong>
                      <span>Install, configure and launch.</span>
                      <ArrowUpRightIcon />
                    </Link>
                    <Link to="/documentation/authentication">
                      <span className="docs-quick-icon docs-quick-icon-teal">
                        <KeyRound size={21} />
                      </span>
                      <strong>Understand auth</strong>
                      <span>Follow the session lifecycle.</span>
                      <ArrowUpRightIcon />
                    </Link>
                  </div>
                )}
                <div className="docs-markdown" key={guide.id}>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[
                      [rehypeSlug, { prefix: "doc-" }],
                      [rehypeHighlight, highlightOptions],
                    ]}
                    components={markdownComponents}
                  >
                    {guide.content}
                  </Markdown>
                </div>
                <footer className="docs-article-footer">
                  <span>Continue exploring</span>
                  <div>
                    {previous ? (
                      <Link to={guidePath(previous.id)}>
                        <ArrowLeft size={16} />
                        <span>
                          <small>Previous guide</small>
                          {previous.title}
                        </span>
                      </Link>
                    ) : (
                      <span />
                    )}
                    {next && (
                      <Link to={guidePath(next.id)} className="docs-next-guide">
                        <span>
                          <small>Next guide</small>
                          {next.title}
                        </span>
                        <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </footer>
              </article>
            ) : (
              <article className="docs-article docs-not-found">
                <FileText size={36} />
                <h1 ref={title} tabIndex={-1}>
                  Guide not found
                </h1>
                <p>
                  This guide does not exist. Choose a topic from the navigation
                  or search the documentation.
                </p>
                <Link to="/documentation">
                  Back to project overview <ArrowRight size={16} />
                </Link>
              </article>
            )}
            <aside className="docs-toc" aria-label="On this page">
              <span className="docs-toc-label">ON THIS PAGE</span>
              <nav>
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={activeHeading === heading.id ? "is-active" : ""}
                  >
                    {heading.title}
                  </a>
                ))}
              </nav>
              <div className="docs-toc-note">
                <span className="docs-live-dot" />
                Local project documentation
                <p>
                  Examples use placeholders. Keep real credentials in your
                  backend environment.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      className="docs-quick-arrow"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
