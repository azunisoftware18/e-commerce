import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ✅ GET SETTINGS (single)
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data;
    },
  });
};