import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMeetings, endMeeting, deleteMeeting } from '@/lib/mock-data';

export function useMeetings() {
  return useQuery({
    queryKey: ['admin-meetings'],
    queryFn: fetchMeetings,
  });
}

export function useEndMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => endMeeting(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-meetings'] }),
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMeeting(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-meetings'] }),
  });
}
