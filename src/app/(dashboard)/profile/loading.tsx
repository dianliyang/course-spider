export default function ProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white animate-pulse">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Profile header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 pb-16 border-b border-gray-100">
          <div className="w-32 h-32 bg-gray-100 rounded-full"></div>
          <div className="flex-grow space-y-3">
            <div className="h-8 bg-gray-100 rounded w-48"></div>
            <div className="h-5 bg-gray-50 rounded w-64"></div>
            <div className="flex gap-6 mt-4">
              <div className="h-4 bg-gray-50 rounded w-32"></div>
              <div className="h-4 bg-gray-50 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 py-16 border-b border-gray-100">
          <div className="space-y-4">
            <div className="h-3 bg-gray-100 rounded w-20"></div>
            <div className="h-16 bg-gray-50 rounded w-24"></div>
            <div className="h-10 bg-gray-50 rounded w-48"></div>
          </div>
          <div className="space-y-4">
            <div className="h-3 bg-gray-100 rounded w-20"></div>
            <div className="h-16 bg-gray-50 rounded w-24"></div>
            <div className="h-10 bg-gray-50 rounded w-48"></div>
          </div>
          <div className="space-y-4 hidden md:block">
            <div className="h-3 bg-gray-100 rounded w-20"></div>
            <div className="h-8 bg-gray-50 rounded w-32"></div>
          </div>
          <div className="space-y-4 hidden md:block">
            <div className="h-3 bg-gray-100 rounded w-20"></div>
            <div className="h-16 bg-gray-50 rounded w-24"></div>
          </div>
        </div>

        {/* Fingerprint section skeleton */}
        <div className="py-24 border-b border-gray-100">
          <div className="space-y-4 mb-20">
            <div className="h-3 bg-gray-100 rounded w-32"></div>
            <div className="h-8 bg-gray-100 rounded w-56"></div>
          </div>
          <div className="h-32 bg-gray-50 rounded-3xl"></div>
        </div>
      </main>
    </div>
  );
}
