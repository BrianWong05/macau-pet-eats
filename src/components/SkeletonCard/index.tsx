export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      {/* Image skeleton */}
      <div className="aspect-[4/3] animate-shimmer" />
      
      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Title skeleton */}
        <div className="h-6 w-3/4 rounded-lg animate-shimmer" />
        
        {/* Badge skeleton */}
        <div className="h-6 w-1/2 rounded-full animate-shimmer" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-4 w-2/3 rounded animate-shimmer" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-1/3 rounded animate-shimmer" />
          <div className="h-4 w-1/4 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
