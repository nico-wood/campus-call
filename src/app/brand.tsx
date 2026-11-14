export function Brand({ href = "/" }: { href?: string }) {
  return (
    <a href={href} className="brand-link">
      <svg className="brand-mark" width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <path className="brand-mark-signal" d="M35.3 12.7a16 16 0 1 0 0 22.6" strokeWidth="2.4" strokeLinecap="round" />
        <path className="brand-mark-orbit" d="M30.4 17.6a9 9 0 1 0 0 12.8" strokeWidth="2.4" strokeLinecap="round" />
        <path className="brand-mark-signal" d="M35.2 24h4.6" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="brand-type">
        <span className="brand-name brand-wordmark">Campus Call</span>
        <span className="brand-descriptor" aria-hidden="true">Campus forecasts</span>
      </span>
    </a>
  );
}
