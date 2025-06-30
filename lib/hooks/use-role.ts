"use client"

import { useAuth } from "@/lib/auth/auth-context"

export function useRole() {
  const { user, hasRole } = useAuth()

  const isAdmin = () => hasRole("ADMIN")
  const isAgronomist = () => hasRole("AGRONOMIST")
  const isFarmer = () => hasRole("FARMER")
  const isDeveloper = () => hasRole("DEVELOPER")
  const isModerator = () => hasRole("MODERATOR")

  const canManageUsers = () => hasRole("ADMIN")
  const canManageDiseases = () => hasRole(["AGRONOMIST", "ADMIN", "RESEARCHER"])
  const canManageMedicines = () => hasRole(["AGRONOMIST", "ADMIN"])
  const canCreateAdvice = () => hasRole(["AGRONOMIST", "ADMIN"])
  const canRespondToFeedback = () => hasRole(["AGRONOMIST", "ADMIN", "MODERATOR"])

  return {
    user,
    hasRole,
    isAdmin,
    isAgronomist,
    isFarmer,
    isDeveloper,
    isModerator,
    canManageUsers,
    canManageDiseases,
    canManageMedicines,
    canCreateAdvice,
    canRespondToFeedback,
  }
}
