"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TableEmpty,
  TablePagination,
} from "./core";
import { ImageIcon, FileText } from "lucide-react";

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
  const [imageErrors, setImageErrors] = useState({});
  const pageSize = 5;

  useEffect(() => {
    setPage(1);
  }, [search, selectedType, selectedDate]);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Helper function to get the best available image URL
  const getThumbnailUrl = (plan) => {
    // Priority order: thumbnailSignedUrl > thumbnail > thumbnailKey
    if (plan.thumbnailSignedUrl) return plan.thumbnailSignedUrl;
    if (plan.thumbnail && plan.thumbnail.startsWith('http')) return plan.thumbnail;
    if (plan.thumbnailKey) {
      return `https://azzunique-fintech-node.s3.ap-south-1.amazonaws.com/${plan.thumbnailKey}`;
    }
    return null;
  };

  // Helper function to get PDF URL
  const getPdfUrl = (plan) => {
    if (plan.pdfUrl && plan.pdfUrl.startsWith('http')) return plan.pdfUrl;
    if (plan.pdfKey) {
      return `https://azzunique-fintech-node.s3.ap-south-1.amazonaws.com/${plan.pdfKey}`;
    }
    return null;
  };

  const columns = [
    {
      label: "Name",
      accessor: "name",
      render: (value, row) => {
        const thumbnailUrl = getThumbnailUrl(row);
        const pdfUrl = getPdfUrl(row);
        
        return (
          <div className="flex items-center gap-3">
            {/* Thumbnail Image */}
            <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
              {thumbnailUrl && !imageErrors[row.id] ? (
                <img
                  src={thumbnailUrl}
                  alt={value || "Diet Plan"}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(row.id)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <ImageIcon size={20} className="text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Name & PDF Link */}
            <div className="min-w-0 flex-1">
              <span className="font-medium text-slate-800 block truncate">
                {value}
              </span>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText size={12} />
                  View PDF
                </a>
              )}
            </div>
          </div>
        );
      },
    },
    {
      label: "Description",
      accessor: "description",
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-600 line-clamp-2">
            {value || "No description"}
          </p>
        </div>
      ),
    },
    {
      label: "Price",
      accessor: "price",
      render: (value) => (
        <span className="font-semibold text-slate-800">
          {value === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            `₹${value?.toLocaleString()}`
          )}
        </span>
      ),
    },
    {
      label: "Created At",
      accessor: "createdAt",
      render: (value) => (
        <span className="text-sm text-slate-600">
          {value ? new Date(value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) : "N/A"}
        </span>
      ),
    },
    {
      label: "Type",
      accessor: "type",
      render: (value) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            value === "PAID"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-green-50 text-green-700 border border-green-200"
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
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
        <p className="mt-2 text-sm text-slate-500">Loading diet plans...</p>
      </div>
    );
  }

  return (
    <TableShell
      pagination={
        filteredData.length > pageSize ? (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null
      }
    >
      {/* HEAD */}
      <TableHead
        columns={columns}
        actions={[
          { label: "Edit" },
          { label: "Delete" }
        ]}
        searchProps={{
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search plans...",
        }}
        filterProps={{
          value: selectedType,
          onChange: (value) => setSelectedType(value),
          options: [
            { label: "All Types", value: "All" },
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
              onClick: (row) => onEdit?.(row),
              className: "text-blue-600 hover:text-blue-800",
            },
            {
              label: "Delete",
              onClick: (row) => {
                if (window.confirm("Are you sure you want to delete this plan?")) {
                  deletePlan(row.id);
                }
              },
              className: "text-red-600 hover:text-red-800",
            },
          ]}
        />
      ) : (
        <TableEmpty message="No diet plans found" />
      )}
    </TableShell>
  );
}