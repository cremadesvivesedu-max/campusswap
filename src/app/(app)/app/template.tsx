export default function Template({ children }: { children: React.ReactNode }) {
  // Re-mounts on every navigation inside the app: a short fade-in (off with reduced motion).
  return <div className="cs-page-in">{children}</div>;
}
