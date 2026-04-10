"use client";

import React from "react";
import ConsultationsTable from "@/components/table/ConsultationsTable";
import { useConsultations } from "@/lib/queries/useConsultation";

export default function ConsultationsPage() {
  const { data = [], isLoading } = useConsultations();

  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold mb-4">Consultations</h1>

      <ConsultationsTable
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
}