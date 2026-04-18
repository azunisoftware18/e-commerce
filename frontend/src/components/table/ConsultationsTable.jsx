"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TableEmpty,
  TablePagination,
} from "@/components/table/core";
import { useDietPlans } from "@/lib/queries/useDietPlans";

export default function ConsultationsTable({ data = [], isLoading }) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const { data: dietPlans = [] } = useDietPlans();
  const dietPlanMap = useMemo(() => {
  const map = {};
  dietPlans.forEach((plan) => {
    map[plan.id] = plan.name;
  });
  return map;
}, [dietPlans]);
  const pageSize = 8;

  // ✅ Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, selectedDate]);

  // ✅ Columns
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
        new Date(value).toLocaleDateString(),
    },
  ];

  // ✅ FILTER LOGIC (Search + Date)
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

  // ✅ Pagination
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
      {/* ✅ HEAD */}
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
        showFilter={false} // ❌ dropdown removed
      />

      {/* ✅ BODY */}
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
  );
}