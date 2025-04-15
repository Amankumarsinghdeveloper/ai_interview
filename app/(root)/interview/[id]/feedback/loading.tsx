import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-5 w-6 bg-gray-800" />
        <Skeleton className="h-6 w-64 bg-gray-800" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-8 w-96 bg-gray-800 mb-2" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-40 bg-gray-800" />
          <Skeleton className="h-6 w-6 rounded-full bg-gray-800" />
          <Skeleton className="h-6 w-24 bg-gray-800" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Overall Score Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <Skeleton className="h-7 w-48 bg-gray-800 mb-4" />

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full md:w-auto flex flex-col items-center gap-2">
              <Skeleton className="h-36 w-36 rounded-full bg-gray-800" />
              <Skeleton className="h-6 w-20 bg-gray-800" />
              <Skeleton className="h-5 w-32 bg-gray-800" />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32 bg-gray-800" />
                      <Skeleton className="h-5 w-12 bg-gray-800" />
                    </div>
                    <Skeleton className="h-3 w-full bg-gray-800 rounded-full" />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <Skeleton className="h-7 w-48 bg-gray-800 mb-6" />

          <div className="space-y-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="space-y-3 border-b border-gray-800 pb-6 last:border-0"
                >
                  <Skeleton className="h-6 w-64 bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-3/4 bg-gray-800" />
                </div>
              ))}
          </div>
        </div>

        {/* Additional Feedback Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <Skeleton className="h-7 w-56 bg-gray-800 mb-4" />
          <Skeleton className="h-4 w-full bg-gray-800" />
          <Skeleton className="h-4 w-full bg-gray-800" />
          <Skeleton className="h-4 w-3/4 bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
