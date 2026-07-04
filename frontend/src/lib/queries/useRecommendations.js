import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const useRecommendations = () => {
  return useQuery({
    queryKey: ["recommendations"],

    queryFn: async () => {
      const res = await api.get(
        "/product/recommendations"
      );

      return (
        res?.data?.data?.products || []
      );
    },
  });
};