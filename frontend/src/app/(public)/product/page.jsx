"use client";

import YouMightAlsoLike from "@/components/common/YouMightAlsoLike";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <YouMightAlsoLike
          showAll={true}
          showHeaderButton={false}
        />
      </div>
    </div>
  );
}