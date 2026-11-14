import type { SVGProps } from "react";

// Lucide icons retrieved from 21st.dev/community/icons/lucide.
// ISC (Lucide), MIT (Feather-derived search). See public/fonts/ASSET-LICENSES.txt.
export function UiIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: "settings" | "search" | "chevron" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {name === "settings" ? <><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></> : null}
    {name === "search" ? <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></> : null}
    {name === "chevron" ? <path d="m9 18 6-6-6-6" /> : null}
  </svg>;
}
