import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../../services/user';

export function useAddressesQuery() {
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userAPI.getAddresses,
  });
}

