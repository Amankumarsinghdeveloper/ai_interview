import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 bg-gray-800 mb-2" />
        <Skeleton className="h-5 w-full max-w-xl bg-gray-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg"
            >
              <Skeleton className="h-5 w-32 bg-gray-800 mb-2" />
              <Skeleton className="h-8 w-24 bg-gray-800 mb-1" />
              <Skeleton className="h-4 w-full bg-gray-800" />
            </div>
          ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 bg-gray-800 rounded-lg" />
            <Skeleton className="h-10 w-32 bg-gray-800 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-40 bg-gray-800 rounded-lg" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="p-4 text-left">
                  <Skeleton className="h-6 w-12 bg-gray-800" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-6 w-32 bg-gray-800" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-6 w-36 bg-gray-800" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-6 w-28 bg-gray-800" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-6 w-24 bg-gray-800" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-6 w-28 bg-gray-800" />
                </th>
                <th className="p-4 text-right">
                  <Skeleton className="h-6 w-20 bg-gray-800 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="p-4">
                      <Skeleton className="h-6 w-6 bg-gray-800 rounded-sm" />
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-32 bg-gray-800" />
                        <Skeleton className="h-4 w-40 bg-gray-800" />
                      </div>
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-40 bg-gray-800" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-24 bg-gray-800" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-24 bg-gray-800" />
                    </td>
                    <td className="p-4 text-right">
                      <Skeleton className="h-9 w-9 bg-gray-800 rounded-md ml-auto" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <Skeleton className="h-5 w-40 bg-gray-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 bg-gray-800 rounded-md" />
            <Skeleton className="h-9 w-20 bg-gray-800 rounded-md" />
            <Skeleton className="h-9 w-9 bg-gray-800 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
