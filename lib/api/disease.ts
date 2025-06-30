import apiClient from "./axios"
import type { Disease, CreateDiseaseRequest, PaginatedResponse } from "@/types"

export const diseaseApi = {
  // Get all diseases
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Disease>> => {
    const response = await apiClient.get(`/diseases?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get disease by ID
  getById: async (id: string): Promise<Disease> => {
    const response = await apiClient.get(`/diseases/${id}`)
    return response.data
  },

  // Create disease
  create: async (data: CreateDiseaseRequest): Promise<Disease> => {
    const response = await apiClient.post("/diseases", data)
    return response.data
  },

  // Update disease
  update: async (id: string, data: Partial<CreateDiseaseRequest>): Promise<Disease> => {
    const response = await apiClient.put(`/diseases/${id}`, data)
    return response.data
  },

  // Delete disease
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/diseases/${id}`)
  },
}
