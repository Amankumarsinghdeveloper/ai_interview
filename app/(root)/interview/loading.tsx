import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800">
        <Skeleton className="h-9 w-64 bg-gray-800" />
        <div className="bg-purple-500/10 px-4 py-2 rounded-full text-purple-300 text-sm flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-gray-800" />
          <Skeleton className="h-5 w-32 bg-gray-800" />
        </div>
      </header>

      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="bg-gray-900 p-5 border-b border-gray-800">
          <Skeleton className="h-7 w-48 bg-gray-800" />
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-7 w-40 bg-gray-800" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-7 w-40 bg-gray-800" />
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-7 w-48 bg-gray-800" />
            <div className="flex flex-wrap gap-2">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-24 bg-gray-800 rounded-lg"
                  />
                ))}
            </div>
          </div>

          <Skeleton className="h-12 w-full max-w-xs mx-auto bg-gray-800 rounded-full mt-8" />
        </div>
      </div>
    </div>
  );
}
