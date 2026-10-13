// Grey placeholders shown the moment someone taps a link, while the server builds
// the page. Without them the old screen just freezes and taps feel ignored.

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function GridSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <div className="space-y-3">
        <Block className="h-4 w-24" />
        <Block className="h-8 w-3/4 max-w-md" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Block className="aspect-square w-full" />
            <Block className="h-4 w-1/3" />
            <Block className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Block className="aspect-[4/3] w-full" />
      <div className="space-y-4">
        <Block className="h-8 w-1/3" />
        <Block className="h-6 w-4/5" />
        <Block className="h-4 w-1/2" />
        <Block className="h-24 w-full" />
        <Block className="h-12 w-full" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <div className="flex items-center gap-4 rounded-[28px] bg-white p-6">
        <Block className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <Block className="h-6 w-1/2" />
          <Block className="h-4 w-1/3" />
        </div>
      </div>
      <GridSkeleton />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-[22px] bg-white p-3">
          <Block className="h-14 w-14 shrink-0" />
          <div className="flex-1 space-y-2">
            <Block className="h-4 w-1/2" />
            <Block className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
