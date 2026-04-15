import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ✅ GET ALL
export const useDietPlans = () => {
  return useQuery({
    queryKey: ["diet-plans"],
    queryFn: async () => {
      const res = await api.get("/diet-plan");
      return res.data.data;
    },
  });
};

// ✅ GET SINGLE
export const useDietPlan = (id) => {
  return useQuery({
    queryKey: ["diet-plan", id],
    queryFn: async () => {
      const res = await api.get(`/diet-plan/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

