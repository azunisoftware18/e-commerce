"use client";

import { useState } from "react";
import { useAuditLogs } from "@/lib/queries/useAudit";
import { 
  User, 
  Monitor, 
  Globe, 
  Clock, 
  FileSpreadsheet, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AuditPage() {
  const { data: logs = [], isLoading, error } = useAuditLogs();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = logs.slice(startIndex, endIndex);

  // Reset to page 1 if data changes and current page would be invalid
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // --- LOADING / SKELETON STATE ---
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="p-5 bg-white border-b border-slate-100 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 mb-4">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800">Failed to load audit trail</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          There was an error pulling down the system security logs. Please refresh or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-slate-500" size={24} />
            Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Track system activities, access updates, and automated event trails.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg self-start sm:self-auto select-none">
          {logs.length} Log Entries
        </div>
      </div>

      {/* Main Logs Display Wrapper */}
      {logs.length === 0 ? (
        <div className="border border-slate-200 border-dashed rounded-2xl p-12 text-center bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-500">No events logged yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/40 rounded-2xl overflow-hidden">
          
          {/* Desktop Table Header (Hidden on Mobile viewports) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
            <div className="col-span-3 flex items-center gap-2"><User size={14} /> Actor</div>
            <div className="col-span-3 flex items-center gap-2"><Globe size={14} /> Network Location</div>
            <div className="col-span-3 flex items-center gap-2"><Monitor size={14} /> Client Identity</div>
            <div className="col-span-3 flex items-center gap-2"><Clock size={14} /> Timestamp</div>
          </div>

          {/* Core Logs Stack */}
          <div className="divide-y divide-slate-100">
            {currentLogs.map((log) => (
              <div 
                key={log.id} 
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 md:px-6 md:py-4.5 hover:bg-slate-50/70 items-center transition-colors group"
              >
                {/* 1. Actor Profile Block */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200/60 uppercase text-sm group-hover:bg-white transition-colors shrink-0">
                    {(log.user?.name || "G")[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {log.user?.name || "Guest User"}
                    </p>
                    <span className="md:hidden text-[11px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                      {log.ipAddress}
                    </span>
                  </div>
                </div>

                {/* 2. Network Location (Desktop Only) */}
                <div className="hidden md:col-span-3 md:block min-w-0">
                  <span className="font-mono font-bold text-xs bg-slate-50 border border-slate-200/60 text-slate-600 px-2.5 py-1 rounded-md group-hover:bg-white transition-colors select-all">
                    {log.ipAddress || "0.0.0.0"}
                  </span>
                </div>

                {/* 3. Client UserAgent Identity */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-2 md:block min-w-0 text-slate-500">
                  <span className="md:hidden text-[10px] uppercase font-black tracking-wider text-slate-400 select-none block shrink-0">
                    Device:
                  </span>
                  <p className="text-xs font-medium md:font-semibold text-slate-600 md:text-slate-500 truncate" title={log.userAgent}>
                    {log.userAgent || "Unknown Client"}
                  </p>
                </div>

                {/* 4. Log Execution Timestamp */}
                <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-start gap-2 min-w-0">
                  <span className="md:hidden text-[10px] uppercase font-black tracking-wider text-slate-400 select-none block shrink-0">
                    Logged:
                  </span>
                  <p className="text-xs font-medium text-slate-400 font-mono tracking-tight md:text-slate-600">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-medium text-slate-500">
              Showing {startIndex + 1}–{Math.min(endIndex, logs.length)} of {logs.length} entries
            </div>
            
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="First page"
              >
                <ChevronsLeft size={16} className="text-slate-600" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-0.5 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, and pages around current
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 text-slate-400 text-xs">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                          currentPage === page
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Last page"
              >
                <ChevronsRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}