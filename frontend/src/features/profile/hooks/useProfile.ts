import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";

export function useProfile() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const changePasswordMutation = useMutation({ mutationFn: authApi.changePassword });

  return {
    user,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
