"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TableEmpty,
  TablePagination,
} from "@/components/table/core";
import { useAuditLogs } from "@/lib/queries/useAudit";
import { Download, Loader2, CheckSquare, Square, X } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Button from "@/components/ui/Button";

export default function AuditLogsTable() {
  const { data = [], isLoading } = useAuditLogs();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [exportMode, setExportMode] = useState("filtered");
  const [date, setDate] = useState("");
  const pageSize = 10;

  useEffect(() => {
  setPage(1);
}, [search, date]);

  const columns = [
    {
      label: "User",
      accessor: "user",
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-800">
            {row.user?.name || "Guest"}
          </p>
          <p className="text-xs text-slate-400">
            {row.user?.email || "Not Logged In"}
          </p>
        </div>
      ),
    },
    {
      label: "IP Address",
      accessor: "ipAddress",
    },
    {
      label: "User Agent",
      accessor: "userAgent",
      render: (value) => (
        <div
          className="max-w-xs truncate"
          title={value}
        >
          {value}
        </div>
      ),
    },
    {
      label: "Visited On",
      accessor: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) : "-",
    },
  ];

 const filteredData = useMemo(() => {
  return data.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.user?.name?.toLowerCase().includes(keyword) ||
      item.user?.email?.toLowerCase().includes(keyword) ||
      item.ipAddress?.toLowerCase().includes(keyword);

    const matchesDate =
      !date ||
      new Date(item.createdAt).toISOString().split("T")[0] === date;

    return matchesSearch && matchesDate;
  });
}, [data, search, date]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const handleReset = () => {
  setSearch("");
  setDate("");
  setPage(1);
};

  // Generate data for selected pages
  const getSelectedPagesData = useCallback(() => {
    if (selectedPages.length === 0) return [];

    return selectedPages.flatMap((pageNum) => {
      const start = (pageNum - 1) * pageSize;
      return filteredData.slice(start, start + pageSize);
    });
  }, [selectedPages, filteredData, pageSize]);

  // Export data preparation
  const prepareExportData = useCallback((dataToExport) => {
    return dataToExport.map((item, index) => ({
      "Sr. No.": index + 1,
      "User Name": item.user?.name || "Guest",
      "User Email": item.user?.email || "Not Logged In",
      "User Role": item.user?.role || "-",
      "IP Address": item.ipAddress || "",
      "User Agent": item.userAgent || "",
      "Visited On": item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "",
    }));
  }, []);

  // Handle Excel Export
  const handleExportExcel = useCallback(
    async (exportData, label) => {
      if (exportData.length === 0) {
        toast.error("No data to export");
        return;
      }

      setIsExporting(true);

      try {
        const excelData = prepareExportData(exportData);
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
          { wch: 8 },   // Sr. No.
          { wch: 25 },  // User Name
          { wch: 30 },  // User Email
          { wch: 15 },  // User Role
          { wch: 20 },  // IP Address
          { wch: 50 },  // User Agent
          { wch: 25 },  // Visited On
        ];
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, -5);
        const fileName = `audit_logs_${label}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fileName);

        toast.success(`Exported ${exportData.length} audit logs successfully`);
      } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export data");
      } finally {
        setIsExporting(false);
      }
    },
    [prepareExportData],
  );

  // Export handlers
  const handleQuickExport = useCallback(() => {
    handleExportExcel(filteredData, "all");
  }, [filteredData, handleExportExcel]);

  const handleCurrentPageExport = useCallback(() => {
    handleExportExcel(paginatedData, `page_${page}`);
  }, [paginatedData, page, handleExportExcel]);

  const handleSelectedPagesExport = useCallback(() => {
    const selectedData = getSelectedPagesData();
    if (selectedData.length === 0) {
      toast.error("No pages selected");
      return;
    }
    handleExportExcel(selectedData, `pages_${selectedPages.join("_")}`);
    setShowExportDialog(false);
    setSelectedPages([]);
  }, [getSelectedPagesData, selectedPages, handleExportExcel]);

  const togglePageSelection = (pageNum) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum)
        ? prev.filter((p) => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b),
    );
  };

  const selectAllPages = () => {
    if (selectedPages.length === totalPages) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
    }
  };

  // Export popup component
  const ExportPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Export Audit Logs</h3>
          <button
            onClick={() => {
              setShowExportDialog(false);
              setExportMode("filtered");
            }}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => {
              setExportMode("filtered");
              handleQuickExport();
              setShowExportDialog(false);
            }}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-700">All Filtered Data</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export {filteredData.length} records with current filters
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setExportMode("current");
              handleCurrentPageExport();
              setShowExportDialog(false);
            }}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
              <div>
                <p className="font-semibold text-slate-700">Current Page Only</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export page {page} ({paginatedData.length} records)
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setExportMode("selected")}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
              exportMode === "selected"
                ? "border-indigo-300 bg-indigo-50"
                : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-700">Select Pages</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose specific pages to export
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Page Selection */}
        {exportMode === "selected" && (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">
                Select pages to export ({selectedPages.length} selected)
              </p>
              <button
                onClick={selectAllPages}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {selectedPages.length === totalPages ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const start = (pageNum - 1) * pageSize + 1;
                  const end = Math.min(pageNum * pageSize, filteredData.length);
                  const isSelected = selectedPages.includes(pageNum);

                  return (
                    <button
                      key={pageNum}
                      onClick={() => togglePageSelection(pageNum)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300" />
                        )}
                        <span className="text-sm text-slate-700">Page {pageNum}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {start}-{end} of {filteredData.length}
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            <Button
              text={
                isExporting
                  ? "Exporting..."
                  : selectedPages.length > 0
                  ? `Export ${getSelectedPagesData().length} Records`
                  : "Export Selected Pages"
              }
              icon={
                isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )
              }
              iconPosition="left"
              onClick={handleSelectedPagesExport}
              disabled={selectedPages.length === 0 || isExporting}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <>
      <TableShell
        pagination={
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        }
      >
        <TableHead
          columns={columns}
          searchProps={{
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search audit logs...",
          }}
          dateProps={{
  value: date,
  onChange: (e) => setDate(e.target.value),
}}
          onReset={handleReset}
          showFilter={false}
          showDate={true}
          showReset={true}
          showExport={true}
          exportProps={{
            onExport: () => setShowExportDialog(true),
            isExporting: false,
            exportLabel: "Export Excel",
            exportDisabled: filteredData.length === 0,
          }}
        />

        {paginatedData.length > 0 ? (
          <TableBody
            data={paginatedData}
            columns={columns}
            actions={[]}
          />
        ) : (
          <TableEmpty message="No audit logs found." />
        )}
      </TableShell>

      {/* Export Dialog */}
      {showExportDialog && <ExportPopup />}
    </>
  );
}