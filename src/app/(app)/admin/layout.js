// Admin layout is applied per-page via <AdminShell> (components/app/AdminShell.js)
// so nested pages can pick their own `active` tab. This file exists to clarify
// the route group boundary; it's a pass-through.
export default function AdminSegmentLayout({ children }) {
  return children;
}
