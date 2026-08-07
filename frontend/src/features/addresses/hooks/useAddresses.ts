import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressesApi } from "../api/addressesApi";
import type { AddressPayload } from "../types/addresses.types";

export function useAddresses() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["addresses"], queryFn: addressesApi.list });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const createMutation = useMutation({ mutationFn: addressesApi.create, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: Partial<AddressPayload> }) => addressesApi.update(vars.id, vars.payload),
    onSuccess: invalidate,
  });
  const removeMutation = useMutation({ mutationFn: addressesApi.remove, onSuccess: invalidate });

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}
