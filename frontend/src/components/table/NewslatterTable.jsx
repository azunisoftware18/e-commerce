"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  TableShell,
  TableHead,
  TableBody,
  TableEmpty,
  TablePagination,
} from "@/components/table/core";
import { useNewsletterSubscribers } from "@/lib/queries/useNewsletter";


export default function NewsletterTable() {
  const { data = [], isLoading } = useNewsletterSubscribers();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const columns = [
    {
      label: "Email",
      accessor: "email",
    },
    {
      label: "Subscribed On",
      accessor: "createdAt",
      render: (value) =>
        new Date(value).toLocaleDateString(),
    },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.email
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(
    filteredData.length / pageSize
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const handleReset = () => {
    setSearch("");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-slate-500">
        Loading...
      </div>
    );
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
      <TableHead
        columns={columns}
        searchProps={{
          value: search,
          onChange: (e) =>
            setSearch(e.target.value),
          placeholder: "Search email...",
        }}
        onReset={handleReset}
        showFilter={false}
        showDate={false}
      />

      {paginatedData.length > 0 ? (
        <TableBody
          data={paginatedData}
          columns={columns}
          actions={[]}
        />
      ) : (
        <TableEmpty message="No newsletter subscribers found" />
      )}
    </TableShell>
  );
}