import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { DashboardStats, Inventory, PaginatedResponse } from "@/types/api";
import type { UserAdminOut } from "../types/admin.types";

export const adminApi = {
  dashboard: () => axiosClient.get<DashboardStats>(ENDPOINTS.admin.dashboard).then((r) => r.data),
  listUsers: (page: number, page_size = 20) =>
    axiosClient.get<PaginatedResponse<UserAdminOut>>(ENDPOINTS.users, { params: { page, page_size } }).then((r) => r.data),
  setUserStatus: (id: number, is_active: boolean) =>
    axiosClient.put<UserAdminOut>(`${ENDPOINTS.users}/${id}/status`, { is_active }).then((r) => r.data),
  listInventory: () => axiosClient.get<Inventory[]>(ENDPOINTS.inventory).then((r) => r.data),
  adjustInventory: (productId: number, quantity: number, low_stock_threshold?: number) =>
    axiosClient.put<Inventory>(`${ENDPOINTS.inventory}/${productId}`, { quantity, low_stock_threshold }).then((r) => r.data),
};
