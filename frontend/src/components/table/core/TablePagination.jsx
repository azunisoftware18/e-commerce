"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  containerClassName = "",
  showPrevNext = true,
  maxVisiblePages = 5,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // ✅ Memoized (performance)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, safeCurrentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis-end");
      pages.push(totalPages);
    }

    return pages;
  }, [safeCurrentPage, totalPages, maxVisiblePages]);

  // 🎯 Styles (clean separation)
  const baseBtn =
    "flex items-center justify-center min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A4150]/40";

  const activeBtn =
    "bg-[#2A4150] border-[#2A4150] text-white shadow-sm";

  const inactiveBtn =
    "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#2A4150]/40 hover:text-[#2A4150] active:scale-95";

  const disabledBtn =
    "opacity-30 cursor-not-allowed hover:bg-white hover:border-slate-200 hover:text-slate-600";

  // ✅ Safe handler
  const handlePageChange = (page) => {
    if (page === safeCurrentPage) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 py-4 ${containerClassName}`}
      aria-label="Pagination Navigation"
    >
      {/* Previous */}
      {showPrevNext && (
        <button
          type="button"
          aria-label="Go to previous page"
          disabled={safeCurrentPage === 1}
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          className={`${baseBtn} ${inactiveBtn} ${
            safeCurrentPage === 1 ? disabledBtn : ""
          }`}
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Pages */}
      <div className="flex items-center gap-1.5">
        {pageNumbers.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={page + index}
                className="px-2 text-slate-400 select-none"
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
              className={`${baseBtn} ${
                isActive ? activeBtn : inactiveBtn
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {showPrevNext && (
        <button
          type="button"
          aria-label="Go to next page"
          disabled={safeCurrentPage === totalPages}
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          className={`${baseBtn} ${inactiveBtn} ${
            safeCurrentPage === totalPages ? disabledBtn : ""
          }`}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </nav>
  );
}