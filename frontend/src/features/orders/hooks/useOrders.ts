import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/ordersApi";

export function useOrders(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["orders", page, pageSize],
    queryFn: () => ordersApi.list({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(id as number),
    enabled: !!id,
  });
}

export function useAdminOrders(page = 1, pageSize = 20, status?: string) {
  return useQuery({
    queryKey: ["admin-orders", page, pageSize, status],
    queryFn: () => ordersApi.adminList({ page, page_size: pageSize, status }),
    placeholderData: (prev) => prev,
  });
}
