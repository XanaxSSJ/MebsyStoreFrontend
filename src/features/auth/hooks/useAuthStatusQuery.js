import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../../../services/auth';

export function useAuthStatusQuery() {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: authAPI.checkAuth,
  });
}

