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

export const useLocationByPincode = (pincode) => {
  return useQuery({
    queryKey: ["location", pincode],
    queryFn: async () => {
      if (!pincode || pincode.length !== 6) return null;

      const res = await api.get(`/location/pincode/${pincode}`);
      return res.data.data;
    },
    enabled: !!pincode && pincode.length === 6,
    retry: false,
  });
};