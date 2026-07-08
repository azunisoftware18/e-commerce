import { useMutation } from "@tanstack/react-query";
import { logWebsiteVisit } from "../api";

export const useAuditVisit = () => {
  return useMutation({
    mutationFn: logWebsiteVisit,
  });
};