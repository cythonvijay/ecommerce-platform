import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { Review } from "@/types/api";
import type { ReviewPayload } from "../types/reviews.types";

export const reviewsApi = {
  listForProduct: (productId: number) =>
    axiosClient.get<Review[]>(`${ENDPOINTS.reviews}/product/${productId}`).then((r) => r.data),
  create: (payload: ReviewPayload) => axiosClient.post<Review>(ENDPOINTS.reviews, payload).then((r) => r.data),
};
