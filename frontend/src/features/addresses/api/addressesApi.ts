import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { Address } from "@/types/api";
import type { AddressPayload } from "../types/addresses.types";

export const addressesApi = {
  list: () => axiosClient.get<Address[]>(ENDPOINTS.addresses).then((r) => r.data),
  create: (payload: AddressPayload) => axiosClient.post<Address>(ENDPOINTS.addresses, payload).then((r) => r.data),
  update: (id: number, payload: Partial<AddressPayload>) =>
    axiosClient.put<Address>(`${ENDPOINTS.addresses}/${id}`, payload).then((r) => r.data),
  remove: (id: number) => axiosClient.delete(`${ENDPOINTS.addresses}/${id}`),
};
