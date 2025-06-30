import apiClient from "./axios"
import type { Medicine, CreateMedicineRequest, PaginatedResponse } from "@/types"

export const medicineApi = {
  // Get all medicines
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Medicine>> => {
    const response = await apiClient.get(`/medecines?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get medicine by ID
  getById: async (id: string): Promise<Medicine> => {
    const response = await apiClient.get(`/medecines/${id}`)
    return response.data
  },

  // Create medicine
  create: async (data: CreateMedicineRequest): Promise<Medicine> => {
    const response = await apiClient.post("/medecines", data)
    return response.data
  },

  // Update medicine
  update: async (id: string, data: Partial<CreateMedicineRequest>): Promise<Medicine> => {
    const response = await apiClient.put(`/medecines/${id}`, data)
    return response.data
  },

  // Delete medicine
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/medecines/${id}`)
  },
}
