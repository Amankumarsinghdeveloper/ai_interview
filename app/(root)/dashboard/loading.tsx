import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border border-gray-800/50 p-8 sm:p-10 mb-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex flex-col gap-6 max-w-lg">
            <Skeleton className="h-12 w-64 bg-gray-800" />
            <Skeleton className="h-6 w-full bg-gray-800" />
            <Skeleton className="h-6 w-3/4 bg-gray-800" />

            <div className="flex items-center justify-between gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 mb-4">
              <div>
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-8 w-20 bg-gray-700 mt-2" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md bg-gray-700" />
            </div>

            <Skeleton className="h-14 w-48 rounded-full bg-gray-800" />
          </div>

          <div className="relative md:flex-1 w-full md:w-auto">
            <Skeleton className="h-80 w-80 rounded-lg bg-gray-800 mx-auto" />
          </div>
        </div>
      </section>

      {/* Recent Interviews Section Skeleton */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-gray-800 to-gray-700 rounded-full"></div>
            <Skeleton className="h-8 w-48 bg-gray-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                className="h-40 w-full rounded-xl bg-gray-800"
              />
            ))}
        </div>
      </section>

      {/* Available Interviews Section Skeleton */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-gray-800 to-gray-700 rounded-full"></div>
            <Skeleton className="h-8 w-56 bg-gray-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                className="h-40 w-full rounded-xl bg-gray-800"
              />
            ))}
        </div>
      </section>
    </>
  );
}
