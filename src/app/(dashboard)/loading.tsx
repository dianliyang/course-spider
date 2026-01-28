export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="h-4 bg-gray-100 rounded w-48"></div>
            <div className="h-10 bg-gray-100 rounded w-96"></div>
            <div className="h-14 bg-gray-50 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar skeleton */}
        <div className="w-64 space-y-8">
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-50 rounded"></div>
            <div className="h-8 bg-gray-50 rounded"></div>
            <div className="h-8 bg-gray-50 rounded"></div>
          </div>
        </div>
        {/* Course list skeleton */}
        <div className="flex-grow space-y-4">
          <div className="h-10 bg-gray-50 rounded w-full"></div>
          <div className="h-40 bg-gray-50 rounded w-full"></div>
          <div className="h-40 bg-gray-50 rounded w-full"></div>
          <div className="h-40 bg-gray-50 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
