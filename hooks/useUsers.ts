import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  fetchUsers,
  banUser,
  unbanUser,
  setUserRole,
  deleteUser,
  createUser,
  updateUserPhone,
  fetchReservedAlanyaPhones,
  addReservedAlanyaPhone,
  removeReservedAlanyaPhone,
  checkAssignablePhone,
} from '@/lib/mock-data';
import type { CreateUserPayload, ReservedAlanyaPhonesParams } from '@/types';

interface UsersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  idPays?: string;
  sort?: string;
  order?: string;
}

export function useUsers(params: UsersParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => banUser(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unbanUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, typeCompte }: { id: number; typeCompte: number }) => setUserRole(id, typeCompte),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateUserPhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, alanyaPhone }: { id: number; alanyaPhone: string }) =>
      updateUserPhone(id, alanyaPhone),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user-detail', id] });
    },
  });
}

export function useReservedAlanyaPhones(
  params: ReservedAlanyaPhonesParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['admin-reserved-phones', params],
    queryFn: () => fetchReservedAlanyaPhones(params),
    enabled: options?.enabled ?? true,
  });
}

export function useAddReservedPhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, label }: { phone: string; label: string }) =>
      addReservedAlanyaPhone(phone, label),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reserved-phones'] }),
  });
}

export function useRemoveReservedPhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => removeReservedAlanyaPhone(phone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reserved-phones'] }),
  });
}

export function useCheckAssignablePhone(phone: string | null, enabled = true) {
  return useQuery({
    queryKey: ['admin-check-assignable-phone', phone],
    queryFn: () => checkAssignablePhone(phone!),
    enabled: enabled && !!phone,
    staleTime: 10_000,
  });
}
