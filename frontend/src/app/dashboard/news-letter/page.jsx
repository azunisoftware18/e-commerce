"use client";

import NewsletterTable from "@/components/table/NewslatterTable";


export default function NewsletterPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-white min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150]">
          Newsletter Subscribers
        </h1>

        <p className="text-sm md:text-base text-slate-500">
          View all newsletter subscribers.
        </p>
      </div>
      </header>

      <NewsletterTable />
    </div>
  );
}