import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/productsApi";
import type { ProductListParams } from "@/types/api";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.get(id as number),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["product-slug", slug],
    queryFn: () => productsApi.getBySlug(slug as string),
    enabled: !!slug,
  });
}
