export interface UserOut {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  role: "admin" | "customer";
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserOut;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: number;
  brand: string | null;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  images: ProductImage[];
  in_stock: boolean;
  stock_quantity: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ProductListParams {
  page?: number;
  page_size?: number;
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  line_total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
}

export interface Address {
  id: number;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  available: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_users: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: { order_number: string; status: string; total: number }[];
}

export interface ApiError {
  success: boolean;
  message: string;
  detail?: unknown;
}
