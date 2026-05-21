"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TableShell, TableHead, TableBody, TablePagination } from "./core";
import { ChevronDown, ChevronRight, ImageIcon } from "lucide-react";

export default function CategoriesTable({
  data = [],
  onEdit,
  onDelete,
  onDeleteSubCategory,
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 10;

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. Columns Setup
  const columns = [
    {
      label: "Category Name",
      accessor: "name",
      render: (value, row) => (
        <div className="flex items-center  gap-2">
          {row.subCategories?.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRow(row.id);
              }}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {expandedRows[row.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {row.isSub ? (
  <div className="w-8 h-8 rounded border flex items-center justify-center bg-slate-100">
    <ImageIcon size={16} className="text-slate-500" />
  </div>
) : (
  <img
    src={row.image || "https://via.placeholder.com/40?text=No"}
    alt="category"
    className="w-8 h-8 rounded object-cover border"
  />
)}
          <span
            className={`${row.isSub ? "text-slate-800 pl-4" : "font-bold text-slate-800"}`}
          >
            {row.isSub && <span className="mr-2 text-slate-300"></span>}
            {value}
          </span>
        </div>
      ),
    },
    { label: "SKU", accessor: "sku" },
    {
      label: "Description",
      accessor: "description",
      render: (value) => <span className="line-clamp-1">{value || "---"}</span>,
    },
    {
      label: "Sub",
      accessor: "subCount",
      render: (_, row) =>
        !row.isSub && (
          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
            {row.subCategories?.length || 0}
          </span>
        ),
    },
  ];

  // 2. Search Filter
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, data]);

  const displayData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const paginatedParents = filteredData.slice(start, start + itemsPerPage);

    const flattened = [];
    paginatedParents.forEach((parent) => {
      // Parent add karo
      flattened.push({ ...parent, isSub: false });

      if (expandedRows[parent.id] && parent.subCategories) {
        parent.subCategories.forEach((sub) => {
          flattened.push({
            ...sub,
            isSub: true,
            parentId: parent.id, // reference ke liye
          });
        });
      }
    });
    return flattened;
  }, [filteredData, page, expandedRows]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
        actions={[{ label: "Edit" }, { label: "Delete" }]}
        showSearch={true}
        searchProps={{
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search categories...",
        }}
        showFilter={false}
        showDate={false}
        showReset={false}
      />

      <TableBody
        data={displayData}
        columns={columns}
        actions={[
          {
            label: "Edit",
            onClick: (row) =>
              row.isSub ? onEdit(row, "subcategory") : onEdit(row),
          },
          {
            label: "Delete",
            onClick: (row) =>
              row.isSub ? onDeleteSubCategory(row.id) : onDelete(row.id),
          },
        ]}
      />
    </TableShell>
  );
}
