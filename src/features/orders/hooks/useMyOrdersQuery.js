import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../../../services/orders';

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: ['orders', 'me'],
    queryFn: orderAPI.getMyOrders,
  });
}

