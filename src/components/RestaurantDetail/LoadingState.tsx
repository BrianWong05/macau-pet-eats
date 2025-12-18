export function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="h-64 md:h-96 animate-shimmer" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded-lg animate-shimmer" />
          <div className="h-6 w-1/2 rounded-lg animate-shimmer" />
          <div className="h-32 rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
