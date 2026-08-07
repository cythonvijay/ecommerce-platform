import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { TokenResponse, UserOut } from "@/types/api";
import type { RegisterPayload, LoginPayload, ChangePasswordPayload } from "../types/auth.types";

export const authApi = {
  register: (payload: RegisterPayload) =>
    axiosClient.post<TokenResponse>(ENDPOINTS.auth.register, payload).then((r) => r.data),
  login: (payload: LoginPayload) =>
    axiosClient.post<TokenResponse>(ENDPOINTS.auth.login, payload).then((r) => r.data),
  logout: () => axiosClient.post(ENDPOINTS.auth.logout),
  getProfile: () => axiosClient.get<UserOut>(ENDPOINTS.auth.profile).then((r) => r.data),
  updateProfile: (payload: { full_name?: string; phone?: string }) =>
    axiosClient.put<UserOut>(ENDPOINTS.auth.profile, payload).then((r) => r.data),
  changePassword: (payload: ChangePasswordPayload) =>
    axiosClient.post(ENDPOINTS.auth.changePassword, payload),
};
