import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ GET USER WISHLIST
// ==============================
export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],

    queryFn: async () => {
      const res = await api.get("/wishlist/get-wishlist");

      return res?.data?.data?.wishlist || null;
    },
  });
};