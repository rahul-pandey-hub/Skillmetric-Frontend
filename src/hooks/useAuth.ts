import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore, User } from '@/store/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      toast.success('Login successful');

      // Navigate based on role
      switch (data.user.role) {
        case 'SUPER_ADMIN':
          navigate('/super-admin');
          break;
        case 'ORG_ADMIN':
          navigate('/org-admin');
          break;
        case 'RECRUITER':
          navigate('/recruiter');
          break;
        case 'INSTRUCTOR':
          navigate('/instructor');
          break;
        case 'STUDENT':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Still logout even if API call fails
      logout();
      navigate('/login');
    },
  });
}

export function useVerifyToken() {
  const { setUser, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      setLoading(false);
    },
    onError: () => {
      setUser(null);
      setLoading(false);
    },
  });
}
