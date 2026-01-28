import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../../services/user';

export function useProfileQuery() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userAPI.getProfile,
  });
}

