import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div className="text-center">
        <Skeleton className="h-10 w-64 mx-auto bg-gray-800 mb-4" />
        <Skeleton className="h-5 w-full max-w-xs mx-auto bg-gray-800" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
        <Skeleton className="h-6 w-32 mx-auto bg-gray-800 mb-6" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20 bg-gray-800" />
            <Skeleton className="h-10 w-full rounded-md bg-gray-800" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-gray-800" />
            <Skeleton className="h-10 w-full rounded-md bg-gray-800" />
          </div>

          <Skeleton className="h-10 w-full rounded-md bg-gray-800" />
        </div>

        <div className="flex items-center my-6">
          <Skeleton className="h-px flex-1 bg-gray-800" />
          <Skeleton className="h-5 w-8 mx-4 bg-gray-800" />
          <Skeleton className="h-px flex-1 bg-gray-800" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-md bg-gray-800" />
          <Skeleton className="h-10 w-full rounded-md bg-gray-800" />
        </div>
      </div>

      <div className="text-center">
        <Skeleton className="h-5 w-48 mx-auto bg-gray-800" />
      </div>
    </div>
  );
}
