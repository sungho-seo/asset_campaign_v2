/** 라우트 lazy 로딩 스켈레톤. */
export function PageLoader() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-card bg-neutral-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-card bg-neutral-100" />
    </div>
  );
}
