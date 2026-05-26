import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ GET ALL COUPONS
// ==============================
export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],

    queryFn: async () => {
      const res = await api.get("/coupons");

      return res?.data?.coupons || [];
    },
  });
};

// ==============================
// ✅ GET SINGLE COUPON
// ==============================
export const useCoupon = (id) => {
  return useQuery({
    queryKey: ["coupon", id],

    queryFn: async () => {
      const res = await api.get(`/coupons/${id}`);

      return res?.data?.coupon || null;
    },

    enabled: !!id,
  });
};