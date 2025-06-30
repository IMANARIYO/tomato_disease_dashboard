import apiClient from "./axios"
import type { Detection, CreateDetectionRequest, PaginatedResponse } from "@/types"

export const detectionApi = {
  // Upload image detection
  detect: async (data: CreateDetectionRequest): Promise<Detection> => {
    const formData = new FormData()
    if (data.image) {
      formData.append("image", data.image)
    }
    if (data.imageUrl) {
      formData.append("imageUrl", data.imageUrl)
    }
    if (data.farmerId) {
      formData.append("farmerId", data.farmerId)
    }

    const response = await apiClient.post("/detect", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  // Manual detection via URL
  detectManual: async (imageUrl: string): Promise<Detection> => {
    const response = await apiClient.post("/detect/manual", { imageUrl })
    return response.data
  },

  // Get all detections
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Detection>> => {
    const response = await apiClient.get(`/detect?page=${page}&limit=${limit}`)
    console.log("Response from getAll:", response.data)
    return response.data
  },

  // Get my detections
  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<Detection>> => {
    const response = await apiClient.get(`/detect/my?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get detection by ID
  getById: async (id: string): Promise<Detection> => {
    const response = await apiClient.get(`/detect/${id}`)
    return response.data
  },

  // Delete detection
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/detect/${id}`)
  },
}
