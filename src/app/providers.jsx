import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import ErrorBoundary from '../components/ErrorBoundary';
import { CartProvider } from '../contexts/CartContext';
import { SearchProvider } from '../contexts/SearchContext';

export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SearchProvider>
          <CartProvider>{children}</CartProvider>
        </SearchProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

