import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";
import { guidePath, searchGuides } from "./guides";

export default function DocumentationSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(0);
  const input = useRef(null);
  const listId = useId();
  const navigate = useNavigate();
  const results = searchGuides(query);
  const expanded = focused && Boolean(query.trim());
  const choose = (guide) => {
    navigate(guidePath(guide.id));
    setQuery("");
    setFocused(false);
    input.current?.blur();
  };
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <div
      className="docs-search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Search size={17} className="docs-search-icon" aria-hidden="true" />
      <input
        ref={input}
        type="search"
        role="combobox"
        aria-label="Search documentation"
        placeholder="Search documentation…"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={
          expanded && results[selected] ? `${listId}-${selected}` : undefined
        }
        value={query}
        onFocus={() => setFocused(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelected(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setQuery("");
            setFocused(false);
            input.current?.blur();
          }
          if (expanded && ["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            setSelected((value) =>
              results.length
                ? (value +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    results.length) %
                  results.length
                : 0,
            );
          }
          if (expanded && event.key === "Enter" && results[selected]) {
            event.preventDefault();
            choose(results[selected]);
          }
        }}
      />
      {query ? (
        <button
          className="docs-search-clear"
          aria-label="Clear search"
          type="button"
          onClick={() => {
            setQuery("");
            input.current?.focus();
          }}
        >
          <X size={14} />
        </button>
      ) : (
        <kbd>
          {/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K"}
        </kbd>
      )}
      {expanded && (
        <div className="docs-search-results">
          <div className="docs-search-caption" role="status">
            {results.length
              ? `${results.length} matching guides`
              : "No matching guides"}
          </div>
          <ul
            role="listbox"
            id={listId}
            aria-label="Documentation search results"
          >
            {results.map((guide, index) => (
              <li
                role="option"
                aria-selected={selected === index}
                id={`${listId}-${index}`}
                key={guide.id}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setSelected(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(guide)}
                >
                  <span>
                    <strong>{guide.title}</strong>
                    <small>{guide.snippet}</small>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {!results.length && (
            <p>Try “SMTP”, “redirect”, “JWT” or “password”.</p>
          )}
        </div>
      )}
    </div>
  );
}
