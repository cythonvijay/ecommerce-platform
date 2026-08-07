import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviewsApi";

export function useReviews(productId: number | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewsApi.listForProduct(productId as number),
    enabled: !!productId,
  });

  const createMutation = useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-slug"] });
    },
  });

  return { reviews: query.data ?? [], isLoading: query.isLoading, create: createMutation.mutateAsync };
}
