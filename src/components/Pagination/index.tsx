import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    
    // Always show first page
    pages.push(1)
    
    if (currentPage > 3) {
      pages.push('ellipsis')
    }
    
    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }
    
    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => (
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              min-w-[36px] h-9 px-3 rounded-full font-medium text-sm transition-all
              ${currentPage === page
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
              }
            `}
          >
            {page}
          </button>
        )
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
