import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ GET REWARD BALANCE
// ==============================

export const useRewardBalance = () => {
  return useQuery({
    queryKey: ["reward-balance"],

    queryFn: async () => {
      const res = await api.get("/rewards/balance");

      return res?.data?.data || {};
    },
  });
};

// ==============================
// ✅ GET REWARD HISTORY
// ==============================

export const useRewardHistory = () => {
  return useQuery({
    queryKey: ["reward-history"],

    queryFn: async () => {
      const res = await api.get("/rewards/history");

      return res?.data?.data?.history || [];
    },
  });
};