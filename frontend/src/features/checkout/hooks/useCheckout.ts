import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutApi } from "../api/checkoutApi";

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkoutApi.checkout,
    onSuccess: () => {
      queryClient.setQueryData(["cart"], { items: [], subtotal: 0, item_count: 0 });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
