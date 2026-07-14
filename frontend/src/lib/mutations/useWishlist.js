import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

const WISHLIST_QUERY_KEY = ["wishlist"];
const CART_QUERY_KEY = ["cart"];

// 🔑 Session ID helper
const getSessionId = () => {
  if (typeof window === "undefined") return null;
  
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = `guest_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
};

// ==============================
// ✅ ADD TO WISHLIST
// ==============================
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      // 🔥 Auto-add sessionId if not provided
      const payload = {
        ...data,
        sessionId: data.sessionId || getSessionId(),
      };
      return api.post("/wishlist/add-to-wishlist", payload);
    },

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
    mutationFn: (productId) => {
      // 🔥 Send sessionId in request body for DELETE
      return api.delete(`/wishlist/remove-wishlist-item/${productId}`, {
        data: {
          sessionId: getSessionId(),
        },
      });
    },

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
    mutationFn: (data) => {
      // 🔥 Auto-add sessionId if not provided
      const payload = {
        ...data,
        sessionId: data.sessionId || getSessionId(),
      };
      return api.post("/wishlist/move-to-cart", payload);
    },

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