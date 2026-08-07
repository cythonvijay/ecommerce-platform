import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { WishlistItem } from "@/types/api";

export const wishlistApi = {
  list: () => axiosClient.get<WishlistItem[]>(ENDPOINTS.wishlist).then((r) => r.data),
  add: (productId: number) => axiosClient.post<WishlistItem>(ENDPOINTS.wishlist, { product_id: productId }).then((r) => r.data),
  remove: (itemId: number) => axiosClient.delete(`${ENDPOINTS.wishlist}/${itemId}`),
};
