"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";
import { useUpdateOrder } from "@/lib/mutations/useOrders";
import toast from "react-hot-toast";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {
  Eye,
  Package,
  Plus,
  Download,
  Loader2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import Button from "../ui/Button";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL;

export default function OrdersTable({ data = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [exportMode, setExportMode] = useState("filtered"); // "filtered" | "current" | "selected"
  const { mutate: updateOrder } = useUpdateOrder();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [date, setDate] = useState("");
  const [trackingData, setTrackingData] = useState({
    trackingId: "",
    courierName: "",
  });

  const itemsPerPage = 10;

  const handleStatusChange = (id, status) => {
    if (status === "Cancelled") {
      setSelectedOrderId(id);
      setActionType("status");
      setOpenDialog(true);
      return;
    }

    updateOrder({ id, data: { status } });
  };

  const STATUS_OPTIONS = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const handlePaymentChange = (id, payment) => {
    if (payment === "Cancelled" || payment === "Refunded") {
      setSelectedOrderId(id);
      setActionType("payment");
      setOpenDialog(true);
      return;
    }

    updateOrder({ id, data: { payment } });
  };

  const PAYMENT_OPTIONS = [
    "Pending",
    "Paid",
    "Processing",
    "Cancelled",
    "Refunded",
  ];

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const columns = [
    {
      label: "Products",
      accessor: "products", // ✅ unique
      render: (_, row) => (
        <Link
          href={`/dashboard/orders/${row.id}/products`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
        >
          <Eye className="w-4 h-4" />
          View
        </Link>
      ),
    },
    {
      label: "Order ID",
      accessor: "id",
      render: (id) => `${id}`,
    },
    {
      label: "Customer",
      accessor: "customer",
      render: (c) => c?.name || "-",
    },
    {
      label: "Shipping Address",
      accessor: "shipping",
      render: (s) => (
        <div className="text-xs text-slate-600 max-w-50 line-clamp-2">
          {[
            s?.firstName,
            s?.lastName,
            s?.address,
            s?.city,
            s?.state,
            s?.pinCode,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      ),
    },
    {
      label: "Total",
      accessor: "total",
      render: (v) => `₹${v}`,
    },
    {
      label: "Status",
      accessor: "status",
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`text-sm rounded-md px-2 py-1 border focus:outline-none ${getStatusStyle(value)}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Payment",
      accessor: "payment",
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => handlePaymentChange(row.id, e.target.value)}
          className={`text-sm rounded-md px-2 py-1  ${
            value === "Paid"
              ? "bg-green-100 text-green-700"
              : value === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : value === "Processing"
                  ? "bg-blue-100 text-blue-700"
                  : value === "Cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600"
          }`}
        >
          {PAYMENT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Tracking ID",
      accessor: "trackingId",
      render: (v, row) => (
        <button
          onClick={() => {
            setSelectedOrderId(row.id);
            setTrackingData({
              trackingId: row.trackingId || "",
              courierName: row.courierName || "",
            });
            setTrackingDialog(true);
          }}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
            transition-all duration-200 border
            ${
              v
                ? "bg-blue-50 text-black border-blue-200 hover:bg-slate-100"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }
          `}
        >
          {v ? (
            <>
              <Package className="w-3.5 h-3.5" />
              {v}
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add
            </>
          )}
        </button>
      ),
    },
    {
      label: "Courier Name",
      accessor: "courierName",
      render: (v) => v || "-",
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
        <span className="text-xs font-medium text-slate-600">{v || "-"}</span>
      ),
    },
    {
      label: "Order Date",
      accessor: "date",
      render: (value) =>
        value
          ? new Date(value).toLocaleDateString("en-GB").replaceAll("/", "-")
          : "-",
    },
    {
      label: "Cancel Reason",
      accessor: "cancelReason",
      render: (value) => {
        if (!value) return "-";

        if (value.startsWith("STATUS:")) {
          return <span className="text-blue-600 text-xs">{value}</span>;
        }

        if (value.startsWith("PAYMENT:")) {
          return <span className="text-purple-600 text-xs">{value}</span>;
        }

        if (value.startsWith("USER:")) {
          return <span className="text-red-600 text-xs">{value}</span>;
        }

        return <span className="text-slate-600 text-xs">{value}</span>;
      },
    },
  ];

  // Filtered data with date range support
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.items?.[0]?.product?.name
          ?.toLowerCase()
          ?.includes(search.toLowerCase()) ||
        item.id?.toString().includes(search) ||
        item.customer?.name?.toLowerCase()?.includes(search.toLowerCase());

      const matchesStatus = status === "All" || item.status === status;

      const matchesDate =
        !date || new Date(item.date).toISOString().split("T")[0] === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, search, status, date]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

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
    return dataToExport.map((item) => ({
      "Order ID": item.id || "",
      "Customer Name": item.customer?.name || "",
      "Customer Email": item.customer?.email || "",
      "Customer Phone": item.customer?.phone || "",
      "Shipping Address": item.shipping
        ? `${item.shipping.firstName || ""} ${item.shipping.lastName || ""}, ${item.shipping.address || ""}, ${item.shipping.city || ""}, ${item.shipping.state || ""} - ${item.shipping.pinCode || ""}`
        : "",
      "Total Amount": `₹${item.total || 0}`,
      Status: item.status || "",
      "Payment Status": item.payment || "",
      "Payment Mode": item.paymentMode || "",
      "Tracking ID": item.trackingId || "",
      "Courier Name": item.courierName || "",
      "Razorpay Payment ID": item.razorpayPaymentId || "",
      "Razorpay Order ID": item.razorpayOrderId || "",
      "Order Date": item.date
        ? new Date(item.date).toLocaleDateString("en-GB").replaceAll("/", "-")
        : "",
      "Cancel Reason": item.cancelReason || "",
      Products:
        item.items
          ?.map((i) => `${i.product?.name} (Qty: ${i.quantity})`)
          .join(", ") || "",
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
          { wch: 20 },
          { wch: 20 },
          { wch: 25 },
          { wch: 15 },
          { wch: 40 },
          { wch: 15 },
          { wch: 12 },
          { wch: 15 },
          { wch: 15 },
          { wch: 20 },
          { wch: 20 },
          { wch: 25 },
          { wch: 25 },
          { wch: 15 },
          { wch: 30 },
          { wch: 40 },
        ];
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Orders");

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, -5);
        const dateRange =
          startDate && endDate
            ? `_${startDate}_to_${endDate}`
            : startDate
              ? `_from_${startDate}`
              : endDate
                ? `_till_${endDate}`
                : "";
        const fileName = `orders_${label}${dateRange}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fileName);

        toast.success(`Exported ${exportData.length} orders successfully`);
      } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export data");
      } finally {
        setIsExporting(false);
      }
    },
    [startDate, endDate, prepareExportData],
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

  useEffect(() => {
    setPage(1);
  }, [search, status, date]);

  const handleReset = () => {
    setSearch("");
    setStatus("All");
    setDate("");
  };

  // Export popup component
  const ExportPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Export Orders</h3>
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
                <p className="font-semibold text-slate-700">
                  All Filtered Data
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export {filteredData.length} records with current filters
                  {(startDate || endDate) && " (date range applied)"}
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
                <p className="font-semibold text-slate-700">
                  Current Page Only
                </p>
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

        {/* Page Selection (when "Select Pages" is chosen) */}
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
                {selectedPages.length === totalPages
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const start = (pageNum - 1) * itemsPerPage + 1;
                  const end = Math.min(
                    pageNum * itemsPerPage,
                    filteredData.length,
                  );
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
                        <span className="text-sm text-slate-700">
                          Page {pageNum}
                        </span>
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
          actions={[]}
          onReset={handleReset}
          searchProps={{
            value: search,
            placeholder: "Search orders...",
            onChange: (e) => setSearch(e.target.value),
          }}
          filterProps={{
            value: status,
            options: [
              { label: "All", value: "All" },
              { label: "Delivered", value: "Delivered" },
              { label: "Pending", value: "Pending" },
              { label: "Cancelled", value: "Cancelled" },
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

      <ConfirmationDialog
        open={openDialog}
        title="Cancel Order"
        description="Please provide a reason for cancellation."
        confirmText="Submit"
        cancelText="Close"
        variant="danger"
        showRemark={true}
        loading={loading}
        onCancel={() => setOpenDialog(false)}
        onConfirm={(remark) => {
          setLoading(true);

          updateOrder(
            {
              id: selectedOrderId,
              data:
                actionType === "status"
                  ? {
                      status: "Cancelled",
                      cancelReason: `STATUS: ${remark}`,
                    }
                  : {
                      payment: "Cancelled",
                      cancelReason: `PAYMENT: ${remark}`,
                    },
            },
            {
              onSuccess: () => {
                toast.success("Cancelled with reason");
                setOpenDialog(false);
              },
              onError: () => {
                toast.error("Failed");
              },
              onSettled: () => {
                setLoading(false);
              },
            },
          );
        }}
      />

      <ConfirmationDialog
        open={trackingDialog}
        title="Update Tracking Details"
        description="Enter Tracking ID and Courier Name"
        confirmText="Update"
        cancelText="Cancel"
        variant="info"
        loading={loading}
        onCancel={() => setTrackingDialog(false)}
        onConfirm={() => {
          setLoading(true);

          updateOrder(
            {
              id: selectedOrderId,
              data: {
                trackingId: trackingData.trackingId,
                courierName: trackingData.courierName,
              },
            },
            {
              onSuccess: () => {
                toast.success("Tracking Updated");
                setTrackingDialog(false);
              },
              onError: () => {
                toast.error("Update Failed");
              },
              onSettled: () => {
                setLoading(false);
              },
            },
          );
        }}
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tracking ID"
            value={trackingData.trackingId}
            onChange={(e) =>
              setTrackingData({ ...trackingData, trackingId: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="text"
            placeholder="Courier Name"
            value={trackingData.courierName}
            onChange={(e) =>
              setTrackingData({ ...trackingData, courierName: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </ConfirmationDialog>
    </>
  );
}
