export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  category_id: number;
  brand?: string;
  initial_quantity?: number;
  images?: { url: string; alt_text?: string; is_primary?: boolean }[];
}
