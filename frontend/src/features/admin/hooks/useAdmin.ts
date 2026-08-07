import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function useDashboardStats() {
  return useQuery({ queryKey: ["admin-dashboard"], queryFn: adminApi.dashboard });
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminApi.listUsers(page),
    placeholderData: (prev) => prev,
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; is_active: boolean }) => adminApi.setUserStatus(vars.id, vars.is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useAdminInventory() {
  return useQuery({ queryKey: ["admin-inventory"], queryFn: adminApi.listInventory });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: number; quantity: number; low_stock_threshold?: number }) =>
      adminApi.adjustInventory(vars.productId, vars.quantity, vars.low_stock_threshold),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inventory"] }),
  });
}
