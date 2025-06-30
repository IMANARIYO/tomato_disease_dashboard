import apiClient from "./axios"
import type { Feedback, CreateFeedbackRequest, PaginatedResponse } from "@/types"

export const feedbackApi = {
  // Submit feedback on detection
  submitOnDetection: async (data: CreateFeedbackRequest): Promise<Feedback> => {
    const response = await apiClient.post("/feedback/on-detection", data)
    return response.data
  },

  // Submit feedback on advice
  submitOnAdvice: async (data: CreateFeedbackRequest): Promise<Feedback> => {
    const response = await apiClient.post("/feedback/on-advice", data)
    return response.data
  },

  // Get all feedback
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Feedback>> => {
    const response = await apiClient.get(`/feedback?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get feedback by ID
  getById: async (id: string): Promise<Feedback> => {
    const response = await apiClient.get(`/feedback/${id}`)
    return response.data
  },

  // Delete feedback
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/feedback/${id}`)
  },
}
