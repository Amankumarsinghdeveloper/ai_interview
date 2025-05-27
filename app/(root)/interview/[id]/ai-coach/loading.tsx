import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section Skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-64 mx-auto bg-gray-800 mb-2" />
        <Skeleton className="h-6 w-96 mx-auto bg-gray-800" />
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 mb-8">
        {/* Call Interface Skeleton */}
        <div className="flex flex-col">
          {/* Call Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
            <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
            <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
          </div>

          {/* Avatar and Name */}
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-16 w-16 rounded-full bg-gray-800" />
            <div>
              <Skeleton className="h-6 w-40 bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </div>
          </div>

          {/* Chat messages */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0" />
              <Skeleton className="h-24 w-full max-w-[80%] rounded-lg bg-gray-800" />
            </div>
            <div className="flex gap-3 justify-end">
              <Skeleton className="h-16 w-full max-w-[80%] rounded-lg bg-gray-800" />
              <Skeleton className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0" />
              <Skeleton className="h-32 w-full max-w-[80%] rounded-lg bg-gray-800" />
            </div>
          </div>

          {/* Input field */}
          <Skeleton className="h-12 w-full bg-gray-800 rounded-full" />
        </div>
      </div>

      {/* Back Button Skeleton */}
      <div className="flex justify-center mb-8">
        <Skeleton className="h-12 w-40 bg-gray-800 rounded-full" />
      </div>
    </div>
  );
}
