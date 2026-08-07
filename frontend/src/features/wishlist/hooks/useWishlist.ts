import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../api/wishlistApi";
import { useAuthStore } from "@/store/authStore";

export function useWishlist() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.list,
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: wishlistApi.add,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeMutation = useMutation({
    mutationFn: wishlistApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isInWishlist: (productId: number) => (query.data ?? []).some((i) => i.product.id === productId),
    getItemId: (productId: number) => (query.data ?? []).find((i) => i.product.id === productId)?.id,
  };
}
