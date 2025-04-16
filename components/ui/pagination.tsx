import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to show (always show first, last, and pages around current)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];

    // Calculate start and end of the middle section
    let startMiddle = Math.max(2, currentPage - 1);
    let endMiddle = Math.min(totalPages - 1, currentPage + 1);

    // Ensure we always show 3 pages in the middle section
    if (startMiddle > totalPages - 4) {
      startMiddle = totalPages - 4;
      endMiddle = totalPages - 1;
    } else if (endMiddle < 4) {
      startMiddle = 2;
      endMiddle = 4;
    }

    // Add ellipsis before middle section if needed
    if (startMiddle > 2) {
      pages.push(-1); // -1 represents ellipsis
    }

    // Add middle section
    for (let i = startMiddle; i <= endMiddle; i++) {
      pages.push(i);
    }

    // Add ellipsis after middle section if needed
    if (endMiddle < totalPages - 1) {
      pages.push(-2); // -2 represents ellipsis
    }

    // Add last page
    pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="h-8 w-8 p-0 border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((pageNum) => {
        // Handle ellipsis
        if (pageNum < 0) {
          return (
            <span key={`ellipsis-${pageNum}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        return (
          <Button
            key={`page-${pageNum}`}
            variant={pageNum === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className={`h-8 w-8 p-0 ${
              pageNum === currentPage
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border-gray-700 text-gray-400 hover:bg-gray-800"
            }`}
          >
            {pageNum}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="h-8 w-8 p-0 border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
