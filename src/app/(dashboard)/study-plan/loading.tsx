export default function StudyPlanLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white animate-pulse">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-32"></div>
            <div className="h-8 bg-gray-100 rounded w-64"></div>
            <div className="flex gap-8 mt-4">
              <div className="h-16 bg-gray-50 rounded-xl w-24"></div>
              <div className="h-16 bg-gray-50 rounded-xl w-24"></div>
              <div className="h-16 bg-gray-50 rounded-xl w-24"></div>
            </div>
          </div>
        </div>

        {/* Current Focus skeleton */}
        <div className="space-y-32">
          <section>
            <div className="flex items-center gap-6 mb-12">
              <div className="w-11 h-11 bg-gray-100 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-24"></div>
                <div className="h-6 bg-gray-100 rounded w-48"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-0 md:pl-20">
              <div className="h-48 bg-gray-50 rounded-2xl"></div>
              <div className="h-48 bg-gray-50 rounded-2xl"></div>
            </div>
          </section>

          {/* Achievements skeleton */}
          <section>
            <div className="flex items-center gap-6 mb-12">
              <div className="w-11 h-11 bg-gray-100 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-24"></div>
                <div className="h-6 bg-gray-100 rounded w-48"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-0 md:pl-20">
              <div className="h-56 bg-gray-50 rounded-2xl"></div>
              <div className="h-56 bg-gray-50 rounded-2xl"></div>
              <div className="h-56 bg-gray-50 rounded-2xl"></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
