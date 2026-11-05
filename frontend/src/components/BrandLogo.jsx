export default function BrandLogo({ className = "", compact = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={compact ? "0 0 56 56" : "0 0 244 56"}
      fill="none"
      role="img"
      aria-label="Data App"
      className={className}
    >
      <rect x="2" y="2" width="52" height="52" rx="16" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 13h8c10 0 17 6 17 15s-7 15-17 15h-8V13Zm7 7v16h1c6 0 10-3 10-8s-4-8-10-8h-1Z"
        fill="var(--brand-mark-ink, white)"
      />
      <path
        d="M11 21h4m-4 7h4m-4 7h4"
        stroke="var(--brand-mark-ink, white)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".8"
      />
      {!compact && (
        <text
          x="70"
          y="38"
          fill="currentColor"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontSize="32"
          fontWeight="650"
          letterSpacing="-1"
        >
          Data<tspan fontWeight="450"> App</tspan>
        </text>
      )}
    </svg>
  );
}
