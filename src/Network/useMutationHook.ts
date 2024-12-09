import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axiosInstance from '../Network/axiosInstance';
import qs from 'qs';

// Define the type for the mutation function's data parameter
type MutationData = {
  [key: string]: any;
};

// Define the hook's return type
interface UseMutationHookReturn<TData> {
  mutate: (data: MutationData) => void;
  isSuccess: boolean;
  isError: boolean;
  data: TData | undefined;
  isLoading: boolean;
}

/**
 * Common hook for mutations using React Query
 * @param {string} url - The API endpoint URL
 * @param {string} method - The HTTP method (POST, PUT, DELETE, etc.)
 * @param {boolean} [noAuth=false] - Whether the request should exclude the Authorization header
 * @returns {UseMutationHookReturn} An object containing isSuccess, isError, data, isLoading, and mutate function
 */
const useMutationHook = <TData = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  noAuth: boolean = false
): UseMutationHookReturn<TData> => {
  // Define the mutation function
  const mutationFn = async (data: MutationData): Promise<TData> => {
    // Format data for application/x-www-form-urlencoded
    const formattedData = qs.stringify(data);

    const response = await axiosInstance({
      method,
      url,
      data: formattedData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization-Required': !noAuth // Set the flag to conditionally include the token
      },
    });
    return response.data;
  };

  // Set up the mutation using useMutation hook
  const mutationResult: UseMutationResult<TData, unknown, MutationData> = useMutation<TData, unknown, MutationData>({
    mutationFn, // Pass the mutation function here
  });

  // Extract the desired properties from mutationResult
  const { mutate, isSuccess, isError, data, status } = mutationResult;

  // Correctly derive the loading state from status
  const isLoading = status === 'pending';

  // Return only the desired properties
  return { mutate, isSuccess, isError, data, isLoading };
};

export default useMutationHook;