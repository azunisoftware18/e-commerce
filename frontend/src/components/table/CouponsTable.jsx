"use client";

import React, { useState, useMemo, useEffect } from "react";

import {
  TableShell,
  TableHead,
  TableBody,
  TablePagination,
} from "@/components/table/core";



import {
  TicketPercent,
} from "lucide-react";
import { useDeleteCoupon, useToggleCouponStatus } from "@/lib/mutations/useCoupon";

export default function CouponsTable({
  data = [],
  isLoading,
  onEdit,
}) {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("All");

  const itemsPerPage = 10;

  const { mutate: deleteCoupon } =
    useDeleteCoupon();

    const {
  mutate: toggleCouponStatus,
} = useToggleCouponStatus();

  // ==============================
  // TABLE DATA
  // ==============================

  const couponsData = useMemo(() => {
    return data.map((item) => ({
      id: item.id,

      code: item.code,

      discountType: item.discountType,

      discountValue: item.discountValue,

      minOrderAmount: item.minOrderAmount,

      maxDiscountAmount:
        item.maxDiscountAmount,

      usageLimit: item.usageLimit,

      usedCount: item.usedCount,

      expiryDate: item.expiryDate,

      status: item.isActive
        ? "Active"
        : "Inactive",

      original: item,
    }));
  }, [data]);

  // ==============================
  // TABLE COLUMNS
  // ==============================

  const columns = [
    {
      label: "Coupon",

      accessor: "code",

      render: (value) => (
        <div className="flex items-center gap-3">
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-[#2A4150]/10
              text-[#2A4150]
              flex
              items-center
              justify-center
            "
          >
            <TicketPercent size={18} />
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              {value}
            </p>
          </div>
        </div>
      ),
    },

    {
      label: "Discount",

      accessor: "discountValue",

      render: (value, row) =>
        row.discountType === "percentage"
          ? `${value}%`
          : `₹${value}`,
    },

    {
      label: "Min Order",

      accessor: "minOrderAmount",

      render: (value) => `₹${value}`,
    },

    {
      label: "Max Discount",

      accessor: "maxDiscountAmount",

      render: (value) =>
        value ? `₹${value}` : "-",
    },

    {
      label: "Usage",

      accessor: "usedCount",

      render: (value, row) => (
        <span className="font-medium text-slate-700">
          {value}/{row.usageLimit}
        </span>
      ),
    },

    {
      label: "Expiry",

      accessor: "expiryDate",

      render: (value) =>
        new Date(value).toLocaleDateString(),
    },

   {
  label: "Status",

  accessor: "status",

  render: (value, row) => (
    <button
      onClick={() =>
        toggleCouponStatus(row.id)
      }
      className={`
        relative
        inline-flex
        h-7
        w-14
        items-center
        rounded-full
        transition-all
        duration-300
        ${
          value === "Active"
            ? "bg-green-500"
            : "bg-slate-300"
        }
      `}
    >
      <span
        className={`
          inline-block
          h-5
          w-5
          transform
          rounded-full
          bg-white
          transition-all
          duration-300
          shadow-md
          ${
            value === "Active"
              ? "translate-x-8"
              : "translate-x-1"
          }
        `}
      />
    </button>
  ),
},
  ];

  // ==============================
  // FILTER DATA
  // ==============================

  const filteredData = useMemo(() => {
    return couponsData.filter((item) => {
      const matchesSearch =
        item.code
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" ||
        item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status, couponsData]);

  useEffect(() => {
    setPage(1);
  }, [search, status, couponsData]);

  // ==============================
  // PAGINATION
  // ==============================

  const totalPages = Math.ceil(
    filteredData.length / itemsPerPage,
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;

    return filteredData.slice(
      start,
      start + itemsPerPage,
    );
  }, [filteredData, page]);

  const handleReset = () => {
    setSearch("");

    setStatus("All");
  };

  // ==============================
  // RENDER
  // ==============================

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
          { lable: "Edit" },
          { lable: "Delete" },
        ]}
        onReset={handleReset}
        searchProps={{
          value: search,
          placeholder: "Search coupons...",
          onChange: (e) =>
            setSearch(e.target.value),
        }}
        filterProps={{
          value: status,
          options: [
            {
              label: "All",
              value: "All",
            },

            {
              label: "Active",
              value: "Active",
            },

            {
              label: "Inactive",
              value: "Inactive",
            },
          ],
          onChange: setStatus,
        }}
        dateProps={{}}
      />

      <TableBody
        data={paginatedData}
        columns={columns}
        actions={[
  {
    label: "Edit",

    onClick: (row) =>
      onEdit?.(row.original),
  },

  
]}
      />
    </TableShell>
  );
}