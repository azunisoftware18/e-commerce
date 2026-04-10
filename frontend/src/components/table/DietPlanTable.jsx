"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TableEmpty,
  TablePagination,
} from "./core";

export default function DietPlanTable({
  data = [],
  isLoading,
  deletePlan,
  onEdit,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const pageSize = 5;

  useEffect(() => {
    setPage(1);
  }, [search, selectedType, selectedDate]);

  const columns = [
    {
      label: "Name",
      accessor: "name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={`http://localhost:8000${row.thumbnail}`}
            alt={value}
            className="w-10 h-10 object-cover rounded-lg border"
          />
          <span className="font-medium text-slate-800">{value}</span>
        </div>
      ),
    },
    { label: "Description", accessor: "description" },
    {
      label: "Price",
      accessor: "price",
      render: (value, row) => `₹${value}`,
    },
    {
      label: "Created At",
      accessor: "createdAt",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      label: "Type",
      accessor: "type",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            value === "PAID"
              ? "bg-blue-100 text-blue-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchType = selectedType === "All" || item.type === selectedType;

      const matchDate = selectedDate
        ? new Date(item.createdAt).toISOString().slice(0, 10) === selectedDate
        : true;

      return matchSearch && matchType && matchDate;
    });
  }, [data, search, selectedType, selectedDate]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const handleReset = () => {
    setSearch("");
    setSelectedType("All");
    setSelectedDate("");
    setPage(1);
  };

  if (isLoading) {
    return <div className="p-4 text-slate-500">Loading...</div>;
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
      {/* HEAD */}
      <TableHead
        columns={columns}
        searchProps={{
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search plans...",
        }}
        filterProps={{
          value: selectedType,
          onChange: (value) => setSelectedType(value),
          options: [
            { label: "All", value: "All" },
            { label: "PAID", value: "PAID" },
            { label: "FREE", value: "FREE" },
          ],
        }}
        dateProps={{
          value: selectedDate,
          onChange: (e) => setSelectedDate(e.target.value),
        }}
        onReset={handleReset}
      />

      {/* BODY */}
      {paginatedData.length > 0 ? (
        <TableBody
          data={paginatedData}
          columns={columns}
          actions={[
            {
              label: "Edit",
              onClick: (row) => onEdit(row), 
            },
            {
              label: "Delete",
              onClick: (row) => {
                if (confirm("Are you sure?")) {
                  deletePlan(row.id);
                }
              },
            },
          ]}
        />
      ) : (
        <TableEmpty message="No diet plans found" />
      )}
    </TableShell>
  );
}
