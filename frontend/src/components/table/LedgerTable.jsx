"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";
import { Download, Loader2, CheckSquare, Square, X } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Button from "@/components/ui/Button";

export default function LedgerTable({ data = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [exportMode, setExportMode] = useState("filtered");

  const itemsPerPage = 10;

  const columns = [
    {
      label: "Order Date",
      accessor: "date",
      render: (value) => {
        if (!value) return "-";

        const d = new Date(value);

        return isNaN(d.getTime()) ? "-" : d.toISOString().slice(0, 10);
      },
    },
    { label: "Order ID", accessor: "orderId" },
    { label: "Customer", accessor: "customer" },
    {
      label: "Amount",
      accessor: "amount",
      render: (value) => `₹${value}`,
    },
    {
      label: "Payment Status",
      accessor: "status",
      render: (value) => {
        const v = value?.toLowerCase();

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              v === "paid"
                ? "bg-green-100 text-green-600"
                : v === "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      label: "Razorpay Payment ID",
      accessor: "razorpayPaymentId",
      render: (v) => v || "-",
    },
    {
      label: "Razorpay Order ID",
      accessor: "razorpayOrderId",
      render: (v) => v || "-",
    },
    {
      label: "Payment Mode",
      accessor: "paymentMode",
      render: (v) => (
        <span className="text-xs font-medium text-slate-600">
          {v || "-"}
        </span>
      ),
    },
  ];

  // FILTER LOGIC (SAFE)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.customer?.toLowerCase().includes(search.toLowerCase()) ||
        item.orderId?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || item.status?.toLowerCase() === status.toLowerCase();

      const matchesDate =
        !date || new Date(item.date).toISOString().slice(0, 10) === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, search, status, date]);

  // AUTO RESET PAGE
  useEffect(() => {
    setPage(1);
  }, [search, status, date]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  // RESET
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
      "Order Date": item.date
        ? new Date(item.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
      "Order ID": item.orderId || "",
      "Customer": item.customer || "",
      "Amount": item.amount ? `₹${item.amount}` : "₹0",
      "Payment Status": item.status || "",
      "Razorpay Payment ID": item.razorpayPaymentId || "",
      "Razorpay Order ID": item.razorpayOrderId || "",
      "Payment Mode": item.paymentMode || "",
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
          { wch: 20 },  // Order Date
          { wch: 25 },  // Order ID
          { wch: 25 },  // Customer
          { wch: 15 },  // Amount
          { wch: 15 },  // Payment Status
          { wch: 25 },  // Razorpay Payment ID
          { wch: 25 },  // Razorpay Order ID
          { wch: 15 },  // Payment Mode
        ];
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Ledger Transactions");

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, -5);
        const dateStr = date ? `_${date}` : "";
        const statusStr = status !== "All" ? `_${status}` : "";
        const fileName = `ledger_transactions_${label}${statusStr}${dateStr}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fileName);

        toast.success(`Exported ${exportData.length} transactions successfully`);
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
          <h3 className="text-lg font-bold text-slate-800">Export Transactions</h3>
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

  if (!data.length) {
    return <div className="p-6 text-center">No transactions found</div>;
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
          onReset={handleReset}
          actions={[]}
          searchProps={{
            value: search,
            placeholder: "Search orders...",
            onChange: (e) => setSearch(e.target.value),
          }}
          filterProps={{
            value: status,
            options: [
              { label: "All", value: "All" },
              { label: "Paid", value: "Paid" },
              { label: "Pending", value: "Pending" },
              { label: "Failed", value: "Failed" },
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

        <TableBody data={paginatedData} columns={columns} actions={[]} />
      </TableShell>

      {/* Export Dialog */}
      {showExportDialog && <ExportPopup />}
    </>
  );
}