import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ GET USER CART
// ==============================
export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],

    queryFn: async () => {
      const res = await api.get("/cart/get-cart");

      return res?.data?.data?.cart || null;
    },
  });
};