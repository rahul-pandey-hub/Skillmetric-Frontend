import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Exam } from '@/store/examStore';
import { toast } from 'sonner';

// Fetch all exams
export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Exam[]; total: number }>('/exams');
      return data.data; // Extract the array from the response object
    },
  });
}

// Fetch single exam
export function useExam(examId: string) {
  return useQuery({
    queryKey: ['exams', examId],
    queryFn: async () => {
      const { data } = await apiClient.get<Exam>(`/exams/${examId}`);
      return data;
    },
    enabled: !!examId,
  });
}

// Create exam
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examData: Partial<Exam>) => {
      const { data } = await apiClient.post<Exam>('/exams', examData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    },
  });
}

// Update exam
export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, updates }: { examId: string; updates: Partial<Exam> }) => {
      const { data } = await apiClient.patch<Exam>(`/exams/${examId}`, updates);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exams', variables.examId] });
      toast.success('Exam updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update exam');
    },
  });
}

// Delete exam
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: string) => {
      await apiClient.delete(`/exams/${examId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    },
  });
}

// Fetch exam sessions
export function useExamSessions(examId: string) {
  return useQuery({
    queryKey: ['exam-sessions', examId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/proctoring/exam/${examId}/sessions`);
      return data;
    },
    enabled: !!examId,
    refetchInterval: 5000, // Refetch every 5 seconds for live monitoring
  });
}
