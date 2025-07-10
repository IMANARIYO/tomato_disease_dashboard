export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}

export interface AdminDashboardData {
  totalDiseases: number;
  totalMedicines: number;
  farmerStats: FarmerStats;
  diseaseTrends: DiseaseTrends;
  advicePerformance: AdvicePerformance;
  recentDetections: RecentDetections;
  pendingActions: PendingActions;
  topMedicines: TopMedicines;
}

export interface FarmerStats {
  totalFarmers: number;
  activeFarmers: {
    count: number;
    percentage: number;
  };
}

export interface DiseaseTrends {
  count: number;
  items: DiseaseTrendItem[];
}

export interface DiseaseTrendItem {
  name: string;
  detectionCount: number;
  lastDetection: string; // ISO date string or Date
}

export interface AdvicePerformance {
  total: number;
  withFeedback: number;
  feedbackPercentage: number;
}

export interface RecentDetections {
  count: number;
  items: DetectionSummary[];
}

export interface DetectionSummary {
  id: string;
  disease: string;
  farmer: string;
  detectedAt: string; // ISO date string or Date
  location: string | null;
}

export interface PendingActions {
  unreadNotifications: number;
  pendingFeedback: number;
}

export interface TopMedicines {
  count: number;
  items: TopMedicineItem[];
}

export interface TopMedicineItem {
  name: string;
  usageCount: number;
  diseases: {
    count: number;
    items: string[];
  };
}
