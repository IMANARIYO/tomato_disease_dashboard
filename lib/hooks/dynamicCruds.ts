// lib/hooks/useCrud.ts
import {
    useQuery,
    useMutation,
    useQueryClient,
    
  } from "@tanstack/react-query";
import apiClient from "../api/axios";
export function dynamicCruds<T>() {
    const queryClient = useQueryClient()
  
    const fetchData = (url: string, queryKey: string) =>
      useQuery<T[]>({
        queryKey: [queryKey],
        queryFn: async () => {
          const res = (await apiClient.get(url)).data
          return res.data
        }
      })
  
    const createData = (url: string, queryKey: string) =>
      useMutation({
        mutationFn: async (data: Partial<T>) => {
          const res = await apiClient.post(url, data)
          return res.data
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
  
    const updateData = (url: string, queryKey: string) =>
      useMutation({
        mutationFn: async ({
          id,
          data
        }: {
          id: string | number
          data: Partial<T>
        }) => {
          const res = await apiClient.put(`${url}/${id}`, data)
          return res.data
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
  
    const deleteData = (url: string, queryKey: string) =>
      useMutation({
        mutationFn: async (id: string | number) => {
          const res = await apiClient.delete(`${url}/${id}`)
          return res.data
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
  
    return {
      fetchData,
      createData,
      updateData,
      deleteData
    }
  }