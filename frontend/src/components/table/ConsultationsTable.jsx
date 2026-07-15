"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TableEmpty,
  TablePagination,
} from "@/components/table/core";
import { useDietPlans } from "@/lib/queries/useDietPlans";
import { Download, Loader2, CheckSquare, Square, X } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Button from "@/components/ui/Button";

export default function ConsultationsTable({ data = [], isLoading }) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [exportMode, setExportMode] = useState("filtered");
  const { data: dietPlans = [] } = useDietPlans();
  
  const dietPlanMap = useMemo(() => {
    const map = {};
    dietPlans.forEach((plan) => {
      map[plan.id] = plan.name;
    });
    return map;
  }, [dietPlans]);
  
  const pageSize = 8;

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, selectedDate]);

  // Columns
  const columns = [
    {
      label: "Name",
      accessor: "firstName",
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-800">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-slate-400">
            {row.email || "No Email"}
          </p>
        </div>
      ),
    },
    {
      label: "Phone",
      accessor: "phone",
    },
    {
      label: "Age / Weight",
      accessor: "age",
      render: (_, row) => (
        <span>
          {row.age} yrs / {row.weight} kg
        </span>
      ),
    },
    {
      label: "Health Issues",
      accessor: "healthIssues",
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {(value || []).map((issue, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs bg-slate-100 rounded"
            >
              {issue}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Diet Plan",
      accessor: "dietPlanId",
      render: (value) => dietPlanMap[value] || "—",
    },
    {
      label: "Date",
      accessor: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) : "-",
    },
  ];

  // FILTER LOGIC (Search + Date)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = `${item.firstName} ${item.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchDate = selectedDate
        ? new Date(item.createdAt)
            .toISOString()
            .slice(0, 10) === selectedDate
        : true;

      return matchSearch && matchDate;
    });
  }, [data, search, selectedDate]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const handleReset = () => {
    setSearch("");
    setSelectedDate("");
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
      "Name": `${item.firstName || ""} ${item.lastName || ""}`,
      "Email": item.email || "",
      "Phone": item.phone || "",
      "Age": item.age || "",
      "Weight (kg)": item.weight || "",
      "Health Issues": (item.healthIssues || []).join(", "),
      "Diet Plan": dietPlanMap[item.dietPlanId] || "—",
      "Consultation Date": item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "",
    }));
  }, [dietPlanMap]);

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
          { wch: 25 },  // Name
          { wch: 30 },  // Email
          { wch: 15 },  // Phone
          { wch: 8 },   // Age
          { wch: 12 },  // Weight
          { wch: 30 },  // Health Issues
          { wch: 20 },  // Diet Plan
          { wch: 20 },  // Consultation Date
        ];
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Consultations");

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, -5);
        const dateStr = selectedDate ? `_${selectedDate}` : "";
        const fileName = `consultations_${label}${dateStr}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fileName);

        toast.success(`Exported ${exportData.length} consultations successfully`);
      } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export data");
      } finally {
        setIsExporting(false);
      }
    },
    [selectedDate, prepareExportData],
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
          <h3 className="text-lg font-bold text-slate-800">Export Consultations</h3>
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
                  {selectedDate && " (date filter applied)"}
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
    return <div className="p-4 text-slate-500">Loading...</div>;
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
        {/* HEAD */}
        <TableHead
          columns={columns}
          searchProps={{
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search by name...",
          }}
          dateProps={{
            value: selectedDate,
            onChange: (e) => setSelectedDate(e.target.value),
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

        {/* BODY */}
        {paginatedData.length > 0 ? (
          <TableBody
            data={paginatedData}
            columns={columns}
            actions={[]}
          />
        ) : (
          <TableEmpty message="No consultations found" />
        )}
      </TableShell>

      {/* Export Dialog */}
      {showExportDialog && <ExportPopup />}
    </>
  );
}