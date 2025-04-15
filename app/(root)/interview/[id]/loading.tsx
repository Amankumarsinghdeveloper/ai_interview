import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-5 w-6 bg-gray-800" />
        <Skeleton className="h-6 w-32 bg-gray-800" />
      </div>

      <div className="mb-6">
        <div className="flex flex-row gap-4 justify-between mb-4">
          <div className="flex flex-row gap-4 items-center max-sm:flex-col">
            <div className="flex flex-row gap-4 items-center">
              <Skeleton className="rounded-full size-[40px] bg-gray-800" />
              <Skeleton className="h-6 w-40 bg-gray-800" />
            </div>

            <div className="flex flex-wrap gap-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-8 rounded-full bg-gray-800"
                  />
                ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg bg-gray-800" />
            <Skeleton className="h-10 w-32 rounded-lg bg-gray-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <Skeleton className="h-7 w-40 bg-gray-800 mb-4" />
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0" />
                <Skeleton className="h-20 w-full rounded-lg bg-gray-800" />
              </div>
              <div className="flex gap-3 items-start">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0" />
                <Skeleton className="h-20 w-full rounded-lg bg-gray-800" />
              </div>
              <div className="flex gap-3 items-start">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0" />
                <Skeleton className="h-24 w-full rounded-lg bg-gray-800" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <Skeleton className="h-7 w-40 bg-gray-800 mb-4" />
            <Skeleton className="h-10 w-full bg-gray-800 rounded-lg mb-3" />
            <Skeleton className="h-10 w-32 bg-gray-800 rounded-lg ml-auto" />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <Skeleton className="h-7 w-48 bg-gray-800 mb-4" />
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <Skeleton className="h-5 w-40 bg-gray-800" />
                      <Skeleton className="h-5 w-20 bg-gray-800" />
                    </div>
                    <Skeleton className="h-16 w-full bg-gray-800 rounded-lg" />
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg flex justify-between items-center">
            <Skeleton className="h-6 w-40 bg-gray-800" />
            <Skeleton className="h-10 w-32 bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
