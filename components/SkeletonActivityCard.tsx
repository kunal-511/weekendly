interface SkeletonActivityCardProps {
  count?: number
}

export function SkeletonActivityCard({ count = 1 }: SkeletonActivityCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-300 rounded-full mb-4 mx-auto"></div>
          
          <div className="h-6 bg-gray-300 rounded-lg mb-3"></div>
          
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          
          <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
        </div>
      ))}
    </>
  )
}

export function SkeletonActivityGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
      <SkeletonActivityCard count={count} />
    </div>
  )
}
