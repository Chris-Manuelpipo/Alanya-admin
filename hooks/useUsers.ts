import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, banUser, unbanUser, setUserRole, deleteUser } from '@/lib/mock-data';

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
