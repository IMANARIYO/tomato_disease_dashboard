import apiClient from "./axios"
import type { FeedbackResponse, CreateFeedbackResponseRequest, PaginatedResponse } from "@/types"

export const feedbackResponseApi = {
  // Create feedback response
  create: async (data: CreateFeedbackResponseRequest): Promise<FeedbackResponse> => {
    const response = await apiClient.post("/feedback-responses", data)
    return response.data
  },

  // Get all feedback responses
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<FeedbackResponse>> => {
    const response = await apiClient.get(`/feedback-responses?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get feedback response by ID
  getById: async (id: string): Promise<FeedbackResponse> => {
    const response = await apiClient.get(`/feedback-responses/${id}`)
    return response.data
  },

  // Delete feedback response
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/feedback-responses/${id}`)
  },
}
