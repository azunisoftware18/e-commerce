"use client";

import NewsletterTable from "@/components/table/NewslatterTable";


export default function NewsletterPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Newsletter Subscribers
        </h1>

        <p className="text-slate-500 mt-1">
          View all newsletter subscribers.
        </p>
      </div>

      <NewsletterTable />
    </div>
  );
}