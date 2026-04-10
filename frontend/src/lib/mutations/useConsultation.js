// src/lib/mutations/useConsultation.js

import { useMutation } from "@tanstack/react-query";
import api from "../api";

export const useCreateConsultation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/consultation/create", data);
      return res.data;
    },
  });
};