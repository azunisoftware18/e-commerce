"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";
import { useUpdateOrder } from "@/lib/mutations/useOrders";
import toast from "react-hot-toast";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { Eye, Package, Plus } from "lucide-react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL;
export default function OrdersTable({ data = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const { mutate: updateOrder } = useUpdateOrder();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionType, setActionType] = useState(""); // status | payment
  const [loading, setLoading] = useState(false);
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
  accessor: "id",
  render: (id) => (
    <Link
      href={`/dashboard/orders/${id}/products`}
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
  render: (id) => {
    const parts = id.split("-");

    const firstLine = `${parts[0]}-${parts[1]}`;
    const secondLine = `${parts[2]}-${parts[3]}-${parts[4]}`;

    return (
      <div
        className="text-sm leading-5 whitespace-nowrap"
        title={id}
      >
        <div>{firstLine}</div>
        <div>{secondLine}</div>
      </div>
    );
  },
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
          ? new Date(value).toLocaleDateString("en-GB").replaceAll("/", "-") // 👈 key fix
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

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.items?.[0]?.product?.name
          ?.toLowerCase()
          ?.includes(search.toLowerCase()) ||
        item.id?.toString().includes(search) ||
        item.customer?.name?.toLowerCase()?.includes(search.toLowerCase());

      const matchesStatus = status === "All" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [data, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  // ✅ RESET
  const handleReset = () => {
    setSearch("");
    setStatus("All");
  };

  const [trackingDialog, setTrackingDialog] = useState(false);
const [trackingData, setTrackingData] = useState({
  trackingId: "",
  courierName: "",
});

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
        {/* 🔍 Head */}
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
          dateProps={{}}
        />

        {/* 📊 Body */}
        <TableBody data={paginatedData} columns={columns} actions={[]} />
      </TableShell>
      <ConfirmationDialog
        open={openDialog}
        title="Cancel Order"
        description="Please provide a reason for cancellation."
        confirmText="Submit"
        cancelText="Close"
        variant="danger"
        showRemark={true} // 👈 IMPORTANT
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
                toast.success("Cancelled with reason ");
                setOpenDialog(false);
              },
              onError: () => {
                toast.error("Failed ");
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
          toast.success("Tracking Updated ");
          setTrackingDialog(false);
        },
        onError: () => {
          toast.error("Update Failed");
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  }}
>
  {/* 👇 CUSTOM INPUTS */}
  <div className="space-y-3">
    <input
      type="text"
      placeholder="Tracking ID"
      value={trackingData.trackingId}
      onChange={(e) =>
        setTrackingData({ ...trackingData, trackingId: e.target.value })
      }
      className="w-full border rounded-xl px-3 py-2"
    />

    <input
      type="text"
      placeholder="Courier Name"
      value={trackingData.courierName}
      onChange={(e) =>
        setTrackingData({ ...trackingData, courierName: e.target.value })
      }
      className="w-full border rounded-xl px-3 py-2"
    />
  </div>
</ConfirmationDialog>
    </>
  );
}
