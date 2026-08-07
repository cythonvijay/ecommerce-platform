import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { PaginatedResponse, Product, ProductListParams } from "@/types/api";
import type { ProductPayload } from "../types/products.types";

export const productsApi = {
  list: (params: ProductListParams) =>
    axiosClient.get<PaginatedResponse<Product>>(ENDPOINTS.products, { params }).then((r) => r.data),
  get: (id: number) => axiosClient.get<Product>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),
  getBySlug: (slug: string) => axiosClient.get<Product>(`${ENDPOINTS.products}/slug/${slug}`).then((r) => r.data),
  create: (payload: ProductPayload) => axiosClient.post<Product>(ENDPOINTS.products, payload).then((r) => r.data),
  update: (id: number, payload: Partial<ProductPayload> & { is_active?: boolean }) =>
    axiosClient.put<Product>(`${ENDPOINTS.products}/${id}`, payload).then((r) => r.data),
  remove: (id: number) => axiosClient.delete(`${ENDPOINTS.products}/${id}`),
};
