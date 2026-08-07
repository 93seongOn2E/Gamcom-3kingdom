type PageSkeletonProps = {
  variant?: "home" | "video" | "cards" | "factions" | "broadcast";
};

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-full ${className}`} />;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`pixel-frame skeleton-card ${className}`} />;
}

export function PageSkeleton({ variant = "cards" }: PageSkeletonProps) {
  if (variant === "home") {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-2 md:pt-0">
        <section className="home-overview grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_340px]">
          <div className="pixel-frame p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <SkeletonBar className="mb-3 h-4 w-20" />
                <SkeletonBar className="h-8 w-56" />
              </div>
              <div className="flex gap-2">
                <SkeletonBar className="h-12 w-16 rounded-lg" />
                <SkeletonBar className="h-12 w-16 rounded-lg" />
                <SkeletonBar className="h-12 w-16 rounded-lg" />
              </div>
            </div>
            <SkeletonCard className="aspect-[1180/720]" />
            <SkeletonBar className="mx-auto mt-4 h-4 w-2/3" />
          </div>

          <div className="pixel-frame p-5 md:p-6">
            <SkeletonBar className="mb-6 h-8 w-24" />
            <div className="grid gap-5">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="grid gap-2 border-l border-[rgba(212,167,86,0.28)] pl-5">
                  <SkeletonBar className="h-4 w-24" />
                  <SkeletonBar className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonCard key={index} className="h-36" />
          ))}
        </section>
      </div>
    );
  }

  if (variant === "video") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="pixel-frame overflow-hidden p-5 md:p-7">
          <SkeletonBar className="mb-3 h-4 w-24" />
          <SkeletonBar className="mb-5 h-9 w-80 max-w-full" />
          <SkeletonCard className="aspect-video" />
        </section>
      </div>
    );
  }

  if (variant === "factions") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <SkeletonBar className="mb-3 h-8 w-32" />
            <SkeletonBar className="h-5 w-[min(560px,80vw)]" />
          </div>
          <SkeletonCard className="h-20 w-full md:w-96" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, cardIndex) => (
            <div key={cardIndex} className="pixel-frame overflow-hidden">
              <div className="border-b border-[var(--border)] px-5 py-5">
                <SkeletonBar className="mb-4 h-2 w-16" />
                <SkeletonBar className="mb-3 h-7 w-24" />
                <SkeletonBar className="h-4 w-full" />
              </div>
              <div className="p-4">
                <div className="grid gap-3">
                  {Array.from({ length: 12 }, (_, rowIndex) => (
                    <SkeletonBar key={rowIndex} className="h-7 w-full rounded-md" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "broadcast") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="pixel-frame p-8">
          <SkeletonBar className="mb-4 h-8 w-36" />
          <SkeletonBar className="h-5 w-[min(600px,80vw)]" />
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_, index) => (
              <SkeletonBar key={index} className="h-9 w-24" />
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonCard key={index} className="aspect-[4/3]" />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} className="h-36" />
        ))}
      </div>
    </div>
  );
}
