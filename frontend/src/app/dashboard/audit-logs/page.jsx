import AuditLogsTable from "@/components/table/AuditLogsTable";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <AuditLogsTable />
        </div>
      </div>
    </div>
  );
}