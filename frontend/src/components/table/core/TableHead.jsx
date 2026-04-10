import React from "react";
import SearchField from "@/components/ui/SearchField";
import FilterDropdown from "@/components/ui/FilterDropdown";
import Button from "@/components/ui/Button";

export default function TableHead({
  columns,
  onReset,
  searchProps = {},
  filterProps = {},
  dateProps = {},

  showSearch = true,
  showFilter = true,
  showDate = true,
  showReset = true,
}) {
  return (
    <>
      {/* 1. Filter Bar: Visible on ALL devices */}
      <thead className="bg-white">
        <tr>
          <th
            colSpan={columns.length + 1}
            className="px-4 md:px-6 py-4 border-b border-slate-100 overflow-visible"
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              {/* Search */}
              {showSearch && (
                <div className="w-full lg:max-w-xs">
                  <SearchField {...searchProps} className="w-full" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-visible relative">
                {/* Filter */}
                {showFilter && (
                  <div className="flex-1 sm:flex-none min-w-35 relative z-50">
                    <FilterDropdown {...filterProps} className="w-full" />
                  </div>
                )}

                {/* Date */}
                {showDate && (
                  <input
                    type="date"
                    {...dateProps}
                    className="flex-1 sm:flex-none h-10 px-3 rounded-xl border border-gray-200 text-sm text-slate-600 
        focus:ring-2 focus:ring-[#2A4150]/10 focus:border-[#2A4150] outline-none transition-all"
                  />
                )}

                {/* Reset */}
                {showReset && (
                  <Button
                    text="Reset Filters"
                    onClick={onReset}
                    variant="outline"
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white transition-all duration-200
        flex items-center gap-2 hover:border-gray-400 text-slate-600 
        hover:bg-slate-50 hover:text-slate-900! active:bg-slate-100"
                  />
                )}
              </div>
            </div>
          </th>
        </tr>
      </thead>

      {/* 2. Column Labels: Desktop Only (Hidden on Mobile) */}
      <thead className="hidden md:table-header-group bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
        <tr>
          {columns.map((col, index) => (
            <th
              key={index}
              className={`px-6 py-4 border-b border-slate-100 font-semibold ${col.headerClassName || ""}`}
            >
              {col.label}
            </th>
          ))}
          <th className="px-6 py-4 border-b border-slate-100 text-right">
            Actions
          </th>
        </tr>
      </thead>
    </>
  );
}
