import { createContext, useContext, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/features/cart/api/cartApi";
import { useAuthStore } from "./authStore";
import type { Cart } from "@/types/api";

interface CartContextValue {
  cart: Cart | undefined;
  isLoading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
    staleTime: 10_000,
  });

  const invalidate = (data: Cart) => queryClient.setQueryData(["cart"], data);

  const addMutation = useMutation({
    mutationFn: (vars: { productId: number; quantity: number }) =>
      cartApi.addItem({ product_id: vars.productId, quantity: vars.quantity }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { itemId: number; quantity: number }) => cartApi.updateItem(vars.itemId, vars.quantity),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => queryClient.setQueryData(["cart"], { items: [], subtotal: 0, item_count: 0 }),
  });

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem: async (productId, quantity = 1) => {
          await addMutation.mutateAsync({ productId, quantity });
        },
        updateItem: async (itemId, quantity) => {
          await updateMutation.mutateAsync({ itemId, quantity });
        },
        removeItem: async (itemId) => {
          await removeMutation.mutateAsync(itemId);
        },
        clear: async () => {
          await clearMutation.mutateAsync();
        },
        itemCount: cart?.item_count ?? 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartStore() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartStore must be used within CartProvider");
  return ctx;
}
