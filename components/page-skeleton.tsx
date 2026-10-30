export default function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading">
      <div className="h-7 w-48 rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-72 max-w-full rounded bg-slate-200/70" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70"
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
