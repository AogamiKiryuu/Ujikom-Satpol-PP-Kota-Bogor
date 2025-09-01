'use client';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Banner skeleton */}
        <div className="mb-6">
          <div className="h-20 rounded-2xl bg-gradient-to-r from-blue-500/40 to-purple-500/40 animate-pulse" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Exam list skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
