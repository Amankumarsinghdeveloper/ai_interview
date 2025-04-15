import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-10">
      {/* Profile Information Section Skeleton */}
      <section className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Skeleton className="h-32 w-32 rounded-full bg-gray-800" />

          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-64 bg-gray-800" />
            <Skeleton className="h-5 w-full max-w-md bg-gray-800" />
            <Skeleton className="h-5 w-full max-w-sm bg-gray-800" />

            <div className="flex flex-wrap gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded-md bg-gray-800" />
              <Skeleton className="h-8 w-24 rounded-md bg-gray-800" />
              <Skeleton className="h-8 w-20 rounded-md bg-gray-800" />
            </div>
          </div>
        </div>
      </section>

      {/* Credits Section Skeleton */}
      <section className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 p-6 shadow-lg">
        <Skeleton className="h-8 w-40 bg-gray-800 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Transaction History Section Skeleton */}
      <section className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 p-6 shadow-lg">
        <Skeleton className="h-8 w-56 bg-gray-800 mb-6" />
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex justify-between p-4 border border-gray-800 rounded-lg"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 bg-gray-800" />
                  <Skeleton className="h-4 w-28 bg-gray-800" />
                </div>
                <Skeleton className="h-8 w-24 bg-gray-800" />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
