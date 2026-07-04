import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

const CART_QUERY_KEY = ["cart"];

// ==============================
// ✅ ADD TO CART
// ==============================
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post("/cart/add-to-cart", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
  });
};

// ==============================
// ✅ UPDATE CART QUANTITY
// ==============================
export const useUpdateCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.put("/cart/update-cart", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
  });
};

// ==============================
// ✅ REMOVE CART ITEM
// ==============================
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) =>
      api.delete(`/cart/remove-cart-item/${productId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
  });
};

// ==============================
// ✅ CLEAR CART
// ==============================
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete("/cart/clear-cart"),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
  });
};