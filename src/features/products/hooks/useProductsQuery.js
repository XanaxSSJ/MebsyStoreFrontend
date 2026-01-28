import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../../../services/products';

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productAPI.getAll,
  });
}

