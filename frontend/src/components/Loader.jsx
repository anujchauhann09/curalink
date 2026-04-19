function SkeletonLine({ width = 'w-full' }) {
  return (
    <div
      className={`h-3 rounded-lg mb-2 skeleton-line ${width}`}
    />
  )
}

function SkeletonCard({ lines = 3 }) {
  const widths = ['w-full', 'w-full', 'w-2/3']
  return (
    <div className="card">
      <div className="h-4 rounded-lg mb-3 skeleton-line w-3/4" />
      <div className="h-3 rounded-lg mb-4 skeleton-line w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  )
}

export default function Loader() {
  return (
    <div className="space-y-8 mt-8">
      <div className="card">
        <div className="h-5 rounded-lg mb-4 skeleton-line w-1/4" />
        <div className="space-y-2">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine width="w-4/5" />
        </div>
      </div>

      <div>
        <div className="h-5 rounded-lg mb-4 skeleton-line w-1/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>

      <div>
        <div className="h-5 rounded-lg mb-4 skeleton-line w-1/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      </div>
    </div>
  )
}
