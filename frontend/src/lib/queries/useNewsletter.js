import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ GET ALL NEWSLETTER SUBSCRIBERS
// ==============================
export const useNewsletterSubscribers = () => {
  return useQuery({
    queryKey: ["newsletter"],

    queryFn: async () => {
      const res = await api.get("/newsletter");

      return res?.data?.data || [];
    },
  });
};