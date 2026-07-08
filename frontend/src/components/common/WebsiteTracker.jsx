"use client";

import { useAuditVisit } from "@/lib/mutations/useAudit";
import { useEffect } from "react";

export default function WebsiteTracker() {
  const { mutate } = useAuditVisit();

  useEffect(() => {
    const alreadyVisited = sessionStorage.getItem(
      "website_visit_logged"
    );

    if (!alreadyVisited) {
      mutate();

      sessionStorage.setItem(
        "website_visit_logged",
        "true"
      );
    }
  }, [mutate]);

  return null;
}