"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";
import { useRouter } from "next/navigation";

export default function CustomerTable({ data = [], onEdit, onDelete }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
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
        actions={[
          
          {label: "Edit"},
          {label: "Delete"},
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
  );
}
