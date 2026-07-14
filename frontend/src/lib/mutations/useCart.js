import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

const CART_QUERY_KEY = ["cart"];

// Session ID helper
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
// ✅ ADD TO CART
// ==============================
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        sessionId: data.sessionId || getSessionId(),
      };
      return api.post("/cart/add-to-cart", payload);
    },

    onSuccess: (data) => {
      console.log("✅ Add to Cart Success:", data); // Debug log
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
    onError: (error) => {
      console.error("❌ Add to Cart Error:", error); // Debug log
    },
  });
};

// ==============================
// ✅ UPDATE CART QUANTITY
// ==============================
export const useUpdateCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        sessionId: data.sessionId || getSessionId(),
      };
      return api.put("/cart/update-cart", payload);
    },

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
    mutationFn: ({ productId, sessionId }) => {
      return api.delete(`/cart/remove-cart-item/${productId}`, {
        data: {
          sessionId: sessionId || getSessionId(),
        },
      });
    },

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
    mutationFn: (sessionId) => {
      return api.delete("/cart/clear-cart", {
        data: {
          sessionId: sessionId || getSessionId(),
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEY,
      });
    },
  });
};