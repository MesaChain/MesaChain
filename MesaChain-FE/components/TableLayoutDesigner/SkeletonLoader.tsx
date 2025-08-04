export function SkeletonLoader() {
  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="h-6 bg-gray-600 rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="flex-1 relative overflow-hidden bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg font-medium text-gray-600 mb-2">Loading Table Layout</div>
              <div className="text-sm text-gray-500">Please wait while we load your saved layout...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 