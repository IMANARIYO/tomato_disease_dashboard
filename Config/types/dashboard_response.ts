export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface DashboardData {
  totalDiseases: number;
  totalMedicines: number;
  totalDetections: number;
  diseaseDistribution: DiseaseDistribution;
  healthStatus: HealthStatus;
  recentDetections: RecentDetections;
  adviceStats: AdviceStats;
  feedbackStatus: FeedbackStatus;
  unreadNotifications: number;
}

export interface DiseaseDistribution {
  count: number;
  items: DiseaseItem[];
}

export interface DiseaseItem {
  disease: string;
  count: number;
}

export interface HealthStatus {
  healthy: number;
  diseased: number;
  total: number;
}

export interface RecentDetections {
  count: number;
  items: DetectionItem[];
}

export interface DetectionItem {
  id: string;
  image: string;
  disease: string;
  confidence: number;
  detectedAt: string; // or Date, if you plan to convert to JS Date
}

export interface AdviceStats {
  total: number;
  withMedicine: number;
  percentageWithMedicine: number;
}

export interface FeedbackStatus {
  pending: number;
  total: number;
}


