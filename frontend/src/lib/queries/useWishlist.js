import { useQuery } from "@tanstack/react-query";
import api from "../api";

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
// ✅ GET USER/GUEST WISHLIST
// ==============================
export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],

    queryFn: async () => {
      // 🔥 Get session ID
      const sessionId = getSessionId();
      
      // 🔥 Send sessionId as query parameter
      const res = await api.get("/wishlist/get-wishlist", {
        params: { sessionId }
      });

      return res?.data?.data?.wishlist || null;
    },
    
    staleTime: 0,
    refetchOnMount: true,
  });
};