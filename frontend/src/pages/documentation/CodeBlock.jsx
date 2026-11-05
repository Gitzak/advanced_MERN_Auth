import { Children, isValidElement, useEffect, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

function plainText(value) {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) return value.map(plainText).join("");
  return isValidElement(value) ? plainText(value.props.children) : "";
}

export default function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const code = Children.toArray(children).find(isValidElement);
  const language =
    code?.props.className?.match(/language-([\w-]+)/)?.[1] || "text";
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <div className="docs-code-block">
      <div className="docs-code-toolbar">
        <span>
          <Terminal size={14} aria-hidden="true" />
          {language}
        </span>
        <button
          type="button"
          aria-label={copied ? "Code copied" : "Copy code"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                plainText(children).replace(/\n$/, ""),
              );
              setCopied(true);
              setError("");
            } catch {
              setCopied(false);
              setError("Copy unavailable. Select the code to copy it.");
            }
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre tabIndex={0} aria-label={`${language} code example`}>
        {children}
      </pre>
      {error && (
        <p className="docs-copy-error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
