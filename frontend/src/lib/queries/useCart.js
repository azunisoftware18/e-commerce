import { useQuery } from "@tanstack/react-query";
import api from "../api";

const getSessionId = () => {
  if (typeof window === "undefined") return null;
  
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = `guest_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
};

export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],

    queryFn: async () => {
      const sessionId = getSessionId();
      
      const res = await api.get("/cart/get-cart", {
        params: { sessionId }
      });

      const cart = res?.data?.data?.cart || res?.data?.cart || null;
      
      return cart;
    },
    
    staleTime: 0,
    refetchOnMount: true,
    enabled: true,
  });
};