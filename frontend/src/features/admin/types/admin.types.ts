export interface UserAdminOut {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
}
