// lib/hooks/useCrud.ts
import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryResult,
    UseMutationResult,
  } from "@tanstack/react-query";
import apiClient from "../api/axios";

  
  // Generic CRUD hook
  export function useCrud<T, TVariables = Partial<T>>(
    resourceKey: string,
    resourceUrl: string
  ) {
    const queryClient = useQueryClient();
  
    // GET ALL
    const getAll = (): UseQueryResult<T[]> =>
      useQuery({
        queryKey: [resourceKey],
        queryFn: async () => {
          const res = await apiClient.get<T[]>(resourceUrl);
          return res.data;
        },
      });
  
    // GET BY ID
    const getById = (id: string | number): UseQueryResult<T> =>
      useQuery({
        queryKey: [resourceKey, id],
        queryFn: async () => {
          const res = await apiClient.get<T>(`${resourceUrl}/${id}`);
          return res.data;
        },
        enabled: !!id,
      });
  
    // CREATE
    const create = (): UseMutationResult<T, unknown, TVariables> =>
      useMutation({
        mutationFn: async (data: TVariables) => {
          const res = await apiClient.post<T>(resourceUrl, data);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resourceKey] });
        },
      });
  
    // UPDATE
    const update = (
      id: string | number
    ): UseMutationResult<T, unknown, TVariables> =>
      useMutation({
        mutationFn: async (data: TVariables) => {
          const res = await apiClient.put<T>(`${resourceUrl}/${id}`, data);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resourceKey] });
          queryClient.invalidateQueries({ queryKey: [resourceKey, id] });
        },
      });
  
    // DELETE
    const remove = (id: string | number): UseMutationResult<T, unknown, void> =>
      useMutation({
        mutationFn: async () => {
          const res = await apiClient.delete<T>(`${resourceUrl}/${id}`);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resourceKey] });
          queryClient.invalidateQueries({ queryKey: [resourceKey, id] });
        },
      });
  
    return {
      getAll,
      getById,
      create,
      update,
      remove,
    };
  }
  