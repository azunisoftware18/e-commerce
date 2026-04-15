// src/lib/queries/useConsultation.js

import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ✅ Get all consultations
export const useConsultations = () => {
  return useQuery({
    queryKey: ["consultations"],
    queryFn: async () => {
      const res = await api.get("/consultation");
      return res.data.data;
    },
  });
};

// ✅ Get single consultation
export const useConsultation = (id) => {
  return useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const res = await api.get(`/consultation/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};