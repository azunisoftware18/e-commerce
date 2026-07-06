import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../api";

// ==============================
// ✅ REDEEM REWARD
// ==============================

export const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post(
        "/rewards/redeem",
        data,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reward-balance"],
      });

      queryClient.invalidateQueries({
        queryKey: ["reward-history"],
      });
    },
  });
};