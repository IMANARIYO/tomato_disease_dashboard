import apiClient from "./axios"
import type { Notification, PaginatedResponse } from "@/types"

export const notificationApi = {
  // Get notifications for current user
  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`)
    return response.data
  },

  // Mark all notifications as read
  markAllRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/mark-all-read")
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}/delete`)
  },

  // Get notifications by user ID (admin only)
  getByUserId: async (userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get(`/notifications/user/${userId}?page=${page}&limit=${limit}`)
    return response.data
  },
}
