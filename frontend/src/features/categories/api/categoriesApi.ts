import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { Category } from "@/types/api";
import type { CategoryPayload } from "../types/categories.types";

export const categoriesApi = {
  list: () => axiosClient.get<Category[]>(ENDPOINTS.categories).then((r) => r.data),
  get: (id: number) => axiosClient.get<Category>(`${ENDPOINTS.categories}/${id}`).then((r) => r.data),
  create: (payload: CategoryPayload) => axiosClient.post<Category>(ENDPOINTS.categories, payload).then((r) => r.data),
  update: (id: number, payload: Partial<CategoryPayload> & { is_active?: boolean }) =>
    axiosClient.put<Category>(`${ENDPOINTS.categories}/${id}`, payload).then((r) => r.data),
  remove: (id: number) => axiosClient.delete(`${ENDPOINTS.categories}/${id}`),
};
