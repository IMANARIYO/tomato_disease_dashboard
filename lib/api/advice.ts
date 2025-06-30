import apiClient from "./axios"
import type { Advice, CreateAdviceRequest, PaginatedResponse } from "@/types"

export const adviceApi = {
  // Create advice on detection
  createOnDetection: async (data: CreateAdviceRequest): Promise<Advice> => {
    const response = await apiClient.post("/advice/on-detection", data)
    return response.data
  },

  // Create advice on medicine
  createOnMedicine: async (data: CreateAdviceRequest): Promise<Advice> => {
    const response = await apiClient.post("/advice/on-medicine", data)
    return response.data
  },

  // Get all advices
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Advice>> => {
    const response = await apiClient.get(`/advice?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get advice by ID
  getById: async (id: string): Promise<Advice> => {
    const response = await apiClient.get(`/advice/${id}`)
    return response.data
  },

  // Update advice
  update: async (id: string, data: Partial<CreateAdviceRequest>): Promise<Advice> => {
    const response = await apiClient.put(`/advice/${id}`, data)
    return response.data
  },

  // Delete advice
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/advice/${id}`)
  },
}
