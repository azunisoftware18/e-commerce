import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ✅ Get States
export const useStates = () => {
  return useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const res = await api.get("/location/states");
      return res.data.data;
    },
  });
};

// ✅ Get Cities by State
export const useCities = (state) => {
  return useQuery({
    queryKey: ["cities", state],
    queryFn: async () => {
      if (!state) return [];
      const res = await api.get(`/location/cities/${state}`);
      return res.data.data;
    },
    enabled: !!state, // 🔥 important
  });
};