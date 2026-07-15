"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";
import { useRouter } from "next/navigation";
import { Download, Loader2, CheckSquare, Square, X } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Button from "@/components/ui/Button";

export default function CustomerTable({ data = [], onEdit, onDelete }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [exportMode, setExportMode] = useState("filtered");
  const router = useRouter();

  const itemsPerPage = 10;

  const columns = [
    { label: "Customer", accessor: "customer" },
    { label: "Contact", accessor: "contact" },
    {
      label: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      label: "Join Date",
      accessor: "joinDate",
    },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.customer?.toLowerCase().includes(search.toLowerCase()) ||
        item.contact?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All" || item.status === status;

      const matchesDate = !date || item.joinDate === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, search, status, date]);

  useEffect(() => {
    setPage(1);
  }, [search, status, date]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  const handleReset = () => {
    setSearch("");
    setStatus("All");
    setDate("");
  };

  // Generate data for selected pages
  const getSelectedPagesData = useCallback(() => {
    if (selectedPages.length === 0) return [];

    return selectedPages.flatMap((pageNum) => {
      const start = (pageNum - 1) * itemsPerPage;
      return filteredData.slice(start, start + itemsPerPage);
    });
  }, [selectedPages, filteredData, itemsPerPage]);

  // Export data preparation
  const prepareExportData = useCallback((dataToExport) => {
    return dataToExport.map((item, index) => ({
      "Sr. No.": index + 1,
      "Customer Name": item.customer || "",
      "Contact": item.contact || "",
      "Email": item.email || "",
      "Phone": item.phone || "",
      "Status": item.status || "",
      "Total Spent": item.totalSpent ? `₹${item.totalSpent}` : "₹0",
      "Reward Points": item.rewardPoints || 0,
      "Join Date": item.joinDate || "",
      "Location": item.location || "",
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
          { wch: 25 },  // Customer Name
          { wch: 20 },  // Contact
          { wch: 30 },  // Email
          { wch: 15 },  // Phone
          { wch: 12 },  // Status
          { wch: 15 },  // Total Spent
          { wch: 15 },  // Reward Points
          { wch: 15 },  // Join Date
          { wch: 30 },  // Location
        ];
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Customers");

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, -5);
        const dateStr = date ? `_${date}` : "";
        const statusStr = status !== "All" ? `_${status}` : "";
        const fileName = `customers_${label}${statusStr}${dateStr}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fileName);

        toast.success(`Exported ${exportData.length} customers successfully`);
      } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export data");
      } finally {
        setIsExporting(false);
      }
    },
    [date, status, prepareExportData],
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
          <h3 className="text-lg font-bold text-slate-800">Export Customers</h3>
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
                  {(status !== "All" || date) && " (filters applied)"}
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
                  const start = (pageNum - 1) * itemsPerPage + 1;
                  const end = Math.min(pageNum * itemsPerPage, filteredData.length);
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
          actions={[
            { label: "Edit" },
            { label: "Delete" },
          ]}
          onReset={handleReset}
          searchProps={{
            value: search,
            placeholder: "Search customers...",
            onChange: (e) => setSearch(e.target.value),
          }}
          filterProps={{
            value: status,
            options: [
              { label: "All", value: "All" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ],
            onChange: setStatus,
          }}
          dateProps={{
            value: date,
            onChange: (e) => setDate(e.target.value),
          }}
          showSearch={true}
          showFilter={true}
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

        <TableBody
          data={paginatedData}
          columns={columns}
          actions={[
            {
              label: "Edit",
              onClick: (row) => onEdit?.(row),
            },
            {
              label: "Delete",
              onClick: (row) => onDelete?.(row.id),
            },
          ]}
        />
      </TableShell>

      {/* Export Dialog */}
      {showExportDialog && <ExportPopup />}
    </>
  );
}