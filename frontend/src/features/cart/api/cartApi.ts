import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { Cart } from "@/types/api";
import type { AddCartItemPayload } from "../types/cart.types";

export const cartApi = {
  get: () => axiosClient.get<Cart>(ENDPOINTS.cart).then((r) => r.data),
  addItem: (payload: AddCartItemPayload) => axiosClient.post<Cart>(`${ENDPOINTS.cart}/items`, payload).then((r) => r.data),
  updateItem: (itemId: number, quantity: number) =>
    axiosClient.put<Cart>(`${ENDPOINTS.cart}/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId: number) => axiosClient.delete<Cart>(`${ENDPOINTS.cart}/items/${itemId}`).then((r) => r.data),
  clear: () => axiosClient.delete(ENDPOINTS.cart),
};
