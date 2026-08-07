import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { Order, PaginatedResponse } from "@/types/api";
import type { OrderListParams } from "../types/orders.types";

export const ordersApi = {
  list: (params: OrderListParams) =>
    axiosClient.get<PaginatedResponse<Order>>(ENDPOINTS.orders, { params }).then((r) => r.data),
  get: (id: number) => axiosClient.get<Order>(`${ENDPOINTS.orders}/${id}`).then((r) => r.data),
  adminList: (params: OrderListParams & { status?: string }) =>
    axiosClient.get<PaginatedResponse<Order>>(`${ENDPOINTS.orders}/admin/all`, { params }).then((r) => r.data),
  adminUpdateStatus: (id: number, status: string) =>
    axiosClient.put<Order>(`${ENDPOINTS.orders}/admin/${id}/status`, { status }).then((r) => r.data),
};
