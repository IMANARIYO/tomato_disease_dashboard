import serverApi from "@/Config/AxiosConfig";
import { StorageKeys } from "@/Config/storageKeys";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import React from "react";
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    nextToken?: string;
  };
}

export const useFetchPaginatedData = <T>(
  key: string,
  endpoint: string,
  initialNextToken?: string
) => {
  const queryClient = useQueryClient();

  const allData = React.useRef<T[]>([]);
  const [nextToken, setNextToken] = React.useState<string | undefined>(
    initialNextToken
  );
  const [hasMore, setHasMore] = React.useState<boolean>(true);

  const query = useQuery<PaginatedResponse<T>>({
    queryKey: [key, nextToken],
    queryFn: async () => {
      const url = nextToken
        ? `${endpoint}${
            endpoint.includes("?") ? "&" : "?"
          }nextToken=${nextToken}`
        : endpoint;

      const response = await serverApi.get(url);
      return response.data;
    },
  });

  React.useEffect(() => {
    if (query.data) {
      if (nextToken === initialNextToken) {
        allData.current = query.data.data;
      } else {
        allData.current = [...allData.current, ...query.data.data];
      }

      setHasMore(!!query.data.meta.nextToken);
      setNextToken(query.data.meta.nextToken);
    }
  });

  const loadMore = React.useCallback(() => {
    if (nextToken && hasMore) {
      // Trigger a refetch with the next token
      queryClient.invalidateQueries({
        queryKey: [key, nextToken],
      });
    }
  }, [queryClient, key, nextToken, hasMore]);

  const reset = React.useCallback(() => {
    allData.current = [];
    setNextToken(initialNextToken);
    setHasMore(true);
    queryClient.invalidateQueries({
      queryKey: [key],
    });
  }, [queryClient, key, initialNextToken]);

  return {
    ...query,
    data: allData.current,
    hasMore,
    nextToken,
    loadMore,
    reset,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

// Original hooks remain unchanged
export const useFetchData = <T>(key: string, endpoint: string) => {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => {
      const response = await serverApi.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
  });
};

export const useFetchDataBotBackend = <T>(key: string, endpoint: string) => {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => {
      const response = await serverApi.get(endpoint);
      return response.data;
    },
  });
};

export const useFetchDataById = <T>(key: string, endpoint: string) => {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => {
      const response = await serverApi.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
  });
};

export const useCreateData = <T>(endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => {
      const response = await serverApi.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useUpdateData = <T>(endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: T }) => {
      const response = await serverApi.patch(`${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useUpdateAllData = <T>(endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: T }) => {
      const response = await serverApi.put(`${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useUpdateAllDataById = <T>(endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: T }) => {
      const response = await serverApi.patch(`${endpoint}/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useDeleteData = (endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverApi.delete(`${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useDeleteById = (endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverApi.delete(`${endpoint}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useCreateFormData = <T>(endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => {
      const response = await serverApi.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKeys.ACCESS_TOKEN
          )}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
