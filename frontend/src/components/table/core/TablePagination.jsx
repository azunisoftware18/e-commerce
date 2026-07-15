"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  containerClassName = "",
  showPrevNext = true,
  showPageNumbers = true,
  showPageInfo = true,
  maxVisiblePages = 5,
  size = "md",
}) {
  // Don't render if only one page
  if (!totalPages || totalPages <= 1) return null;

  // Ensure current page is within valid range
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Size variants
  const sizes = {
    sm: {
      button: "min-w-[32px] h-8 px-2 text-xs",
      icon: 16,
    },
    md: {
      button: "min-w-[36px] h-9 px-3 text-sm",
      icon: 18,
    },
    lg: {
      button: "min-w-[40px] h-10 px-4 text-sm",
      icon: 20,
    },
  };

  const currentSize = sizes[size] || sizes.md;

  // Generate page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, safeCurrentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  }, [safeCurrentPage, totalPages, maxVisiblePages]);

  // Base button styles
  const baseBtn = `
    flex items-center justify-center ${currentSize.button} 
    font-medium rounded-lg border transition-all duration-150 
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A4150]/40
    select-none
  `;

  // Active button styles
  const activeBtn = `
    bg-[#2A4150] border-[#2A4150] text-white shadow-sm
    hover:bg-[#1a2a33] hover:border-[#1a2a33]
  `;

  // Inactive button styles
  const inactiveBtn = `
    bg-white border-slate-200 text-slate-600 
    hover:bg-slate-50 hover:border-[#2A4150]/40 hover:text-[#2A4150] 
    active:scale-95
  `;

  // Disabled button styles
  const disabledBtn = `
    opacity-30 cursor-not-allowed 
    hover:bg-white hover:border-slate-200 hover:text-slate-600
    active:scale-100
  `;

  // Safe page change handler
  const handlePageChange = (page) => {
    if (typeof page !== "number") return;
    if (page === safeCurrentPage) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, page) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePageChange(page);
    }
  };

  return (
    <nav
      className={`
        flex flex-col sm:flex-row items-center justify-between gap-4 
        px-4 py-3 border-t border-slate-200 bg-white
        ${containerClassName}
      `}
      aria-label="Pagination Navigation"
      role="navigation"
    >
      {/* Page Info */}
      {showPageInfo && (
        <div className="text-sm text-slate-500">
          Page{" "}
          <span className="font-semibold text-slate-700">
            {safeCurrentPage}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {totalPages}
          </span>
        </div>
      )}

      {/* Pagination Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        {showPrevNext && (
          <button
            type="button"
            aria-label="Go to previous page"
            disabled={safeCurrentPage === 1}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            onKeyDown={(e) => handleKeyDown(e, safeCurrentPage - 1)}
            className={`${baseBtn} ${inactiveBtn} ${
              safeCurrentPage === 1 ? disabledBtn : ""
            }`}
          >
            <ChevronLeft size={currentSize.icon} />
            <span className="hidden sm:inline ml-1">Previous</span>
          </button>
        )}

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1.5">
            {pageNumbers.map((page, index) => {
              // Render ellipsis
              if (typeof page === "string") {
                return (
                  <span
                    key={`${page}-${index}`}
                    className="px-2 text-slate-400 select-none text-sm"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                );
              }

              const isActive = page === safeCurrentPage;

              return (
                <button
                  key={page}
                  type="button"
                  aria-label={`Go to page ${page}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handlePageChange(page)}
                  onKeyDown={(e) => handleKeyDown(e, page)}
                  className={`${baseBtn} ${
                    isActive ? activeBtn : inactiveBtn
                  }`}
                  tabIndex={isActive ? 0 : -1}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

        {/* Next Button */}
        {showPrevNext && (
          <button
            type="button"
            aria-label="Go to next page"
            disabled={safeCurrentPage === totalPages}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            onKeyDown={(e) => handleKeyDown(e, safeCurrentPage + 1)}
            className={`${baseBtn} ${inactiveBtn} ${
              safeCurrentPage === totalPages ? disabledBtn : ""
            }`}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight size={currentSize.icon} />
          </button>
        )}
      </div>

      {/* Quick Jump (Optional) - Uncomment if needed */}
      {/* <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
        <span>Go to:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          defaultValue={safeCurrentPage}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const page = parseInt(e.target.value);
              handlePageChange(page);
            }
          }}
          className="w-16 h-8 px-2 text-center border border-slate-200 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-[#2A4150]/20 focus:border-[#2A4150]
            text-slate-700 text-sm"
        />
      </div> */}
    </nav>
  );
}