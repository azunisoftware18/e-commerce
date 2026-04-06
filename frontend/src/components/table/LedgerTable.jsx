"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";

export default function LedgerTable({ data = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");

  const itemsPerPage = 10;

  const columns = [
    {
      label: "Date",
      accessor: "date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-IN") : "-",
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
  ];

  // ✅ FILTER LOGIC (SAFE)
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

  // ✅ AUTO RESET PAGE (🔥 IMPORTANT)
  useEffect(() => {
    setPage(1);
  }, [search, status, date]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  // ✅ RESET
  const handleReset = () => {
    setSearch("");
    setStatus("All");
    setDate("");
  };
  if (!data.length) {
    return <div className="p-6 text-center">No transactions found</div>;
  }
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
            { label: "Paid", value: "Paid" },
            { label: "Pending", value: "Pending" },
            { label: "Failed", value: "Failed" },
          ],
          onChange: setStatus, // 🔥 cleaner
        }}
        dateProps={{
          value: date,
          onChange: (e) => setDate(e.target.value),
        }}
      />

      <TableBody
        data={paginatedData}
        columns={columns}
        actions={[
          {
            label: "View",
            onClick: (row) => console.log("View", row),
          },
          {
            label: "Delete",
            onClick: (row) => console.log("Delete", row),
          },
        ]}
      />
    </TableShell>
  );
}
