import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

const WISHLIST_QUERY_KEY = ["wishlist"];
const CART_QUERY_KEY = ["cart"];

// ==============================
// ✅ ADD TO WISHLIST
// ==============================
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post("/wishlist/add-to-wishlist", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      });
    },
  });
};

// ==============================
// ✅ REMOVE FROM WISHLIST
// ==============================
export const useRemoveWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) =>
      api.delete(`/wishlist/remove-wishlist-item/${productId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      });
    },
  });
};

// ==============================
// ✅ MOVE TO CART
// ==============================
export const useMoveToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post("/wishlist/move-to-cart", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
  });
};