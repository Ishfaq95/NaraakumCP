// src/Network/queryClient.ts
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Define default options for queries
const defaultQueryOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false, // Disable refetch on window focus
    retry: 2, // Retry failed queries twice
  },
};

// Create a new Query Client instance
const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

export default queryClient;
