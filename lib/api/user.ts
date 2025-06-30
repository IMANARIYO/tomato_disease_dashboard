import apiClient from "./axios"
import type { User, UpdateUserRoleRequest, PaginatedResponse } from "@/types"

export const userApi = {
  // Get all users (admin only)
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get(`/auth/getAllUsers?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/auth/user/${id}`)
    return response.data
  },

  // Change user role (admin only)
  changeRole: async (id: string, data: UpdateUserRoleRequest): Promise<User> => {
    const response = await apiClient.patch(`/auth/changeUserRole/${id}`, data)
    return response.data
  },

  // Delete user (admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/auth/deleteUserById/${id}`)
  },
}
