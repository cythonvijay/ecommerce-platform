import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { Order } from "@/types/api";
import type { CheckoutPayload } from "../types/checkout.types";

export const checkoutApi = {
  checkout: (payload: CheckoutPayload) =>
    axiosClient.post<Order>(`${ENDPOINTS.orders}/checkout`, payload).then((r) => r.data),
};
