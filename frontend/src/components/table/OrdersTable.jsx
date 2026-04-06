"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TablePagination,
} from "./core";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL;
export default function OrdersTable({ data = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const itemsPerPage = 10;

  const columns = [
  {
    label: "Product",
    accessor: "items",
    render: (items) => (
      <div className="flex items-center gap-2">
        <img
          src={`${BASE_URL}${items?.[0]?.product?.images?.[0]?.url}`}
          className="w-10 h-10 rounded-lg"
        />
        <span>{items?.[0]?.product?.name || "-"}</span>
      </div>
    ),
  },
  {
    label: "Order ID",
    accessor: "id",
    render: (id) => `#${id?.slice(-6)}`,
  },
  {
    label: "Customer",
    accessor: "customer",
    render: (c) => c?.name || "-",
  },
  {
    label: "Address",
    accessor: "shipping",
    render: (s) => `${s?.city || ""}, ${s?.zip || ""}`,
  },
  {
    label: "Total",
    accessor: "total",
    render: (v) => `₹${v}`,
  },
  {
    label: "Status",
    accessor: "status",
    render: (value) => (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
        value === "Delivered"
          ? "bg-green-100 text-green-600"
          : value === "Pending"
          ? "bg-yellow-100 text-yellow-600"
          : "bg-red-100 text-red-600"
      }`}>
        {value}
      </span>
    ),
  },
  {
    label: "Payment",
    accessor: "payment",
  },
];

  const filteredData = useMemo(() => {
  return data.filter((item) => {
    const matchesSearch =
  item.items?.[0]?.product?.name
    ?.toLowerCase()
    ?.includes(search.toLowerCase()) ||
  item.id?.toString().includes(search) ||
  item.customer?.name
    ?.toLowerCase()
    ?.includes(search.toLowerCase());

    const matchesStatus =
      status === "All" || item.status === status;

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

  return (
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
      <TableBody
        data={paginatedData}
        columns={columns}
        actions={[
          {
            label: "View",
            onClick: (row) => console.log("View", row),
          },
          {
            label: "Invoice",
            onClick: (row) => console.log("Invoice", row),
          },
          {
            label: "Cancel",
            onClick: (row) => console.log("Cancel", row),
          },
        ]}
      />
    </TableShell>
  );
}