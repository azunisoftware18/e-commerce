"use client";

import React, { useState } from "react";
// आपके कोर टेबल कॉम्पोनेंट्स का पाथ (अपनी फ़ोल्डर स्ट्रक्चर के हिसाब से बदलें)
import { TableShell, TableHead, TableBody, TablePagination } from "./core";

// 1. डमी ऑडिट लॉग्स डेटा
const DUMMY_AUDIT_LOGS = [
  {
    id: "log-1",
    timestamp: "2026-07-08 14:32:01",
    user: "amit.sharma@company.com",
    action: "User Login",
    module: "Authentication",
    status: "Success",
    ipAddress: "192.168.1.25",
    details: '{"browser": "Chrome", "os": "Windows"}',
  },
  {
    id: "log-2",
    timestamp: "2026-07-08 14:15:10",
    user: "priya.patel@company.com",
    action: "Delete Database Backup",
    module: "Settings",
    status: "Failed",
    ipAddress: "10.0.4.112",
    details: '{"error": "Permission Denied", "role": "Editor"}',
  },
  {
    id: "log-3",
    timestamp: "2026-07-08 11:02:45",
    user: "system.bot@company.com",
    action: "API Key Rotated",
    module: "Security",
    status: "Warning",
    ipAddress: "127.0.0.1",
    details: '{"key_id": "pk_live_...92a4"}',
  },
  {
    id: "log-4",
    timestamp: "2026-07-08 09:45:00",
    user: "rahul.verma@company.com",
    action: "Update Profile Info",
    module: "User Management",
    status: "Success",
    ipAddress: "172.16.254.1",
    details: '{"updated_fields": ["phone", "avatar"]}',
  },
];

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 2. कॉलम्स का कॉन्फ़िगरेशन (Accessor और Render Functions)
  const columns = [
    {
      accessor: "timestamp",
      label: "Timestamp",
      cellClassName: "text-slate-500 font-normal whitespace-nowrap",
    },
    {
      accessor: "user",
      label: "Performed By",
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">
            {value.split("@")[0]}
          </span>
          <span className="text-xs text-slate-400 font-normal md:block hidden">
            {value}
          </span>
        </div>
      ),
    },
    {
      accessor: "action",
      label: "Action",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">{value}</span>
          <span className="text-xs text-slate-400 font-normal md:hidden block mt-0.5">
            [{row.module}]
          </span>
        </div>
      ),
    },
    {
      accessor: "module",
      label: "Module",
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell text-slate-500 font-normal",
    },
    {
      accessor: "status",
      label: "Status",
      render: (value) => {
        const styles = {
          Success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          Failed: "bg-rose-50 text-rose-700 border-rose-200/60",
          Warning: "bg-amber-50 text-amber-700 border-amber-200/60",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[value] || "bg-slate-50 text-slate-600"}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessor: "ipAddress",
      label: "IP Address",
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell font-mono text-xs text-slate-400",
    },
    {
      accessor: "details",
      label: "Meta Data",
      headerClassName: "hidden xl:table-cell",
      cellClassName: "hidden xl:table-cell",
      render: (value) => (
        <code className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded max-w-[200px] truncate block font-mono">
          {value}
        </code>
      ),
    },
  ];

  // 3. रो-लेवल एक्शन्स (जैसे: 'View Details' बटन)
  const tableActions = [
    {
      label: "View Full Log",
      onClick: (row) =>
        alert(`Full Audit Log:\n${JSON.stringify(row, null, 2)}`),
    },
    {
      label: "Copy IP Address",
      onClick: (row) => navigator.clipboard.writeText(row.ipAddress),
    },
  ];

  // 4. पर्मानेंट पजिशनेशन कॉम्पोनेंट (TableShell में पास करने के लिए)
  const paginationComponent = (
    <TablePagination
      currentPage={currentPage}
      totalPages={3}
      onPageChange={(page) => setCurrentPage(page)}
    />
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      {/* पेज हेडर */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500">
          Track all security, system changes, and user activities.
        </p>
      </div>

      {/* कोर टेबल आर्किटेक्चर */}
      <TableShell pagination={paginationComponent}>
        {/* टेबल फ़िल्टर और हेडर */}
        <TableHead
          columns={columns}
          actions={tableActions}
          showSearch={true}
          showFilter={true}
          searchProps={{
            placeholder: "Search by user or action...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
          }}
          filterProps={{
            options: ["All Modules", "Authentication", "Settings", "Security"],
            value: filter,
            onChange: (val) => setFilter(val),
          }}
        />

        {/* टेबल बॉडी (डेटा मैपिंग) */}
        <TableBody
          data={DUMMY_AUDIT_LOGS}
          columns={columns}
          actions={tableActions}
        />
      </TableShell>
    </div>
  );
}
