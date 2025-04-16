import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const renderPageButtons = () => {
    const buttons = [];

    // Always show first page
    buttons.push(
      <Button
        key="first"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        className={
          currentPage === 1
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-800 border-gray-700 text-gray-300"
        }
      >
        1
      </Button>
    );

    // Calculate range of pages to show
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis if needed
    if (startPage > 2) {
      buttons.push(
        <span key="ellipsis-start" className="px-2 text-gray-500">
          ...
        </span>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className={
            currentPage === i
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-800 border-gray-700 text-gray-300"
          }
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis-end" className="px-2 text-gray-500">
          ...
        </span>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key="last"
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className={
            currentPage === totalPages
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-800 border-gray-700 text-gray-300"
          }
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="bg-gray-800 border-gray-700 text-gray-300"
      >
        Previous
      </Button>

      <div className="flex items-center space-x-1">{renderPageButtons()}</div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="bg-gray-800 border-gray-700 text-gray-300"
      >
        Next
      </Button>
    </div>
  );
}
