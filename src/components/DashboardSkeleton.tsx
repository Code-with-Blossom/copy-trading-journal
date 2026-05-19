export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse p-4 md:p-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 w-64 bg-gray-800/80 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-gray-800/50 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-gray-800/80 rounded-lg"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800/60 rounded-2xl border border-gray-700/50"></div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-[400px] bg-gray-800/60 rounded-2xl border border-gray-700/50"></div>

      {/* Filters Skeleton */}
      <div className="h-16 w-full bg-gray-800/60 rounded-2xl border border-gray-700/50"></div>

      {/* Table Skeleton */}
      <div className="h-64 bg-gray-800/60 rounded-2xl border border-gray-700/50"></div>
    </div>
  );
}
