"use client";

import { useFetchData } from "@/hooks/apiHooks";
import React, { createContext, useContext, ReactNode } from "react";
import { MedicineResponse } from "./types/medecine";
import { DashboardResponse } from "./types/dashboard_response";
import { AdminDashboardResponse } from "./types/agronomist_stat";
import { NotificationsResponse } from "./types/notification_type";
import { AdviceListResponse } from "./types/adviceList";
interface AppContextType {
  profileData: UserProfileResponse | null;
  profileLoading: boolean;
  profileError: boolean;
  profileErrorMessage: string | null;
  diseasesData: GetDiseasesResponse | null;
  diseasesLoading: boolean;
  diseasesError: boolean;
  refetchDiseases: () => void;
  medicineData: MedicineResponse | null;
  medicineDataLoading: boolean;
  medicineDataError: boolean;
  medicineDataErrorMessage: string | null;
  refetchMedicines: () => void;
  farmerStatistics: DashboardResponse | null;
  farmerStatisticsLoading: boolean;
  farmerStatisticsError: boolean;
  farmerStatisticsErrorMessage: string | null;
  fetchFarmerStatistics: () => void;
  agronomistStatistics: AdminDashboardResponse | null;
  agronomistStatisticsLoading: boolean;
  agronomistStatisticsError: boolean;
  agronomistStatisticsErrorMessage: string | null;
  fetchAgronomistStatistics: () => void;
  notificationsData: NotificationsResponse | null;
  notificationsLoading: boolean;
  notificationsError: boolean;
  notificationsErrorMessage: string | null;
  refetchNotifications: () => void;
}

export interface UserProfile {
  id: string;
  email: string;
  password: string;
  profilePicture: string;
  role: "FARMER" | "AGRONOMIST" | "ADMIN"; // Extend as needed
  createdAt: string;
  updatedAt: string;
  username: string;
  farmer: Farmer | null;
  agronomist: Agronomist | null;
  feedbackResponse: any[]; // You can define a more specific type if available
  notifications: any[]; // Same here
}

export interface Farmer {
  id: string;
  userId: string;
  regionId: string | null;
  createdAt: string;
  updatedAt: string;
  detections: any[]; // Replace with specific type if available
  feedbacks: any[]; // Replace with specific type if available
}

export interface Agronomist {
  // Define fields if available
}
export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

const UserContext = createContext<AppContextType | undefined>(undefined);

export interface Disease {
  id: string;
  name: string;
  description: string;
  scientificName: string | null;
  symptoms: string | null;
  severity: string | null;
  prevention: string | null;
  treatment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetDiseasesResponse {
  success: boolean;
  message: string;
  data: Disease[];
}

interface ProviderWrapperProps {
  children: ReactNode;
}

const ProviderWrapper: React.FC<ProviderWrapperProps> = ({ children }) => {
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorMessage,
  } = useFetchData<UserProfileResponse>("auth/me", "auth/me");

  console.log(profileData);

  const {
    data: diseasesData,
    isLoading: diseasesLoading,
    isError: diseasesError,
    error: diseasesErrorMessage,
    refetch: refetchDiseases,
  } = useFetchData<GetDiseasesResponse>("diseases", "diseases");

  console.log(diseasesData);

  const {
    data: medicineData,
    isLoading: medicineDataLoading,
    isError: medicineDataError,
    error: medicineDataErrorMessage,
    refetch: refetchMedicines,
  } = useFetchData<MedicineResponse>("medecines", "medecines");

  const {
    data: farmerStatistics,
    isLoading: farmerStatisticsLoading,
    isError: farmerStatisticsError,
    error: farmerStatisticsErrorMessage,
    refetch: refetchFarmerStatistics,
  } = useFetchData<DashboardResponse>("statistics/farmer", "statistics/farmer");

  const {
    data: agronomistStatistics,
    isLoading: agronomistStatisticsLoading,
    isError: agronomistStatisticsError,
    error: agronomistStatisticsErrorMessage,
    refetch: refetchAgronomistStatistics,
  } = useFetchData<AdminDashboardResponse>(
    "statistics/agronomist",
    "statistics/agronomist"
  );

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
    error: notificationsErrorMessage,
    refetch: refetchNotifications,
  } = useFetchData<NotificationsResponse>("notifications", "notifications");

  const {
    data: adviceData,
    isLoading: adviceLoading,
    isError: adviceError,
    error: adviceErrorMessage,
    refetch: refetchAdvice,
  } = useFetchData<AdviceListResponse>("advice", "advice");

  return (
    <UserContext.Provider
      value={
        {
          profileData,
          profileLoading,
          profileError,
          profileErrorMessage,
          diseasesData,
          diseasesLoading,
          diseasesError,
          refetchDiseases,
          medicineData,
          medicineDataLoading,
          medicineDataError,
          medicineDataErrorMessage,
          refetchMedicines,
          farmerStatistics,
          farmerStatisticsLoading,
          farmerStatisticsError,
          farmerStatisticsErrorMessage,
          fetchFarmerStatistics: refetchFarmerStatistics,
          agronomistStatistics,
          agronomistStatisticsLoading,
          agronomistStatisticsError,
          agronomistStatisticsErrorMessage,
          fetchAgronomistStatistics: refetchAgronomistStatistics,
          notificationsData,
          notificationsLoading,
          notificationsError,
          notificationsErrorMessage,
          refetchNotifications,
          adviceData,
          adviceLoading,
          adviceError,
          adviceErrorMessage,
          refetchAdvice,
        } as AppContextType
      }
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("");
  }
  return context;
};

export default ProviderWrapper;
