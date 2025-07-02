// Generated types based on your Prisma schema
export enum Role {
  FARMER = "FARMER",
  AGRONOMIST = "AGRONOMIST",
  ADMIN = "ADMIN",
  DEVELOPER = "DEVELOPER",
  UI_UX = "UI_UX",
  MODERATOR = "MODERATOR",
  SUPPORT = "SUPPORT",
  RESEARCHER = "RESEARCHER",
  DATA_ANALYST = "DATA_ANALYST",
  TESTER = "TESTER",
  CONTENT_MANAGER = "CONTENT_MANAGER",
}

export enum FeedbackCategory {
  accuracy = "accuracy",
  usability = "usability",
  feature = "feature",
  bug = "bug",
  other = "other",
}

export enum FeedbackStatus {
  pending = "pending",
  addressed = "addressed",
  resolved = "resolved",
  rejected = "rejected",
}

export interface User {
  id: string
  email: string
  profilePicture?: string
  role: Role
  createdAt: string
  updatedAt: string
  farmer?: Farmer
  agronomist?: Agronomist
  username?: string
}

export interface Farmer {
  id: string
  userId: string
  regionId?: string
  user: User
  region?: Region
  detections: Detection[]
  feedbacks: Feedback[]
  createdAt: string
  updatedAt: string
}

export interface Agronomist {
  id: string
  userId: string
  user: User
  latitude?: number
  longitude?: number
  regionId?: string
  region?: Region
  advices: Advice[]
  createdAt: string
  updatedAt: string
}

export interface DiseaseStat {
  id: string
  diseaseId: string
  regionId: string
  count: number
  createdAt: string
  updatedAt: string
}

export interface Region {
  id: string
  name: string
  latitude?: number
  longitude?: number
  farmers: Farmer[]
  agronomists: Agronomist[]
  diseaseStats: DiseaseStat[]
  createdAt: string
  updatedAt: string
}

export interface Disease {
  id: string
  name: string
  description?: string
  scientificName?: string
  symptoms?: string
  severity?: string
  prevention?: string
  treatment?: string
  detections: Detection[]
  diseaseStats: DiseaseStat[]
  medicines: Medicine[]

  createdAt: string
  updatedAt: string
}
export interface CreateOrUpdateDiseaseRequest {
  id: string
  name: string
  description?: string
  scientificName?: string
  symptoms?: string
  severity?: string
  prevention?: string
  treatment?: string
  detections: string[]
  diseaseStats: string[]
  medicines: string[]

  createdAt: string
  updatedAt: string}


export interface Detection {
  id: string
  farmerId: string
  farmer: Farmer
  image: string
  diseaseId: string
  disease: Disease
  confidence: number
  latitude?: number
  longitude?: number
  detectedAt: string
  feedbacks: Feedback[]
  advices: Advice[]
  createdAt: string
  updatedAt: string
}

export interface Advice {
  id: string
  detectionId?: string
  detection?: Detection
  agronomistId: string
  agronomist: Agronomist
  prescription: string
  medicineId?: string
  medicine?: Medicine
  feedbacks: Feedback[]
  createdAt: string
  updatedAt: string
}

export interface Feedback {
  id: string
  detectionId: string
  detection: Detection
  farmerId: string
  farmer: Farmer
  category: FeedbackCategory
  status: FeedbackStatus
  comment: string
  adviceId?: string
  advice?: Advice
  response: FeedbackResponse[]
  createdAt: string
  updatedAt: string
}

export interface FeedbackResponse {
  id: string
  message: string
  authorId: string
  author: User
  createdAt: string
  updatedAt: string
  feedbackId: string
  feedback: Feedback
}

export interface Notification {
  id: string
  userId: string
  user: User
  title: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface Medicine {
  id: string
  name: string
  description?: string
  usageInstructions: string[]
  advices: Advice[]
  diseases: Disease[]
  createdAt: string
  updatedAt: string
}
export interface MedicineRequest {
  id: string
  name: string
  description?: string
  usageInstructions: string[]
  advices:  string[]
  diseases:  string[]
  createdAt: string
  updatedAt: string
}


export interface AuthResponse {
  data: {
    access_token: string
    user: User
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  username?: string
  role?: Role
}

// Add missing interfaces and update existing ones

// Add these missing interfaces:
export interface CreateDetectionRequest {
  image?: File
  imageUrl?: string
  farmerId?: string
}

export interface CreateDiseaseRequest {
  name: string
  description?: string
  scientificName?: string
  symptoms?: string
  severity?: string
  medicines?: string[]
  detections?: string[]
  diseaseStats?: string[]
  createdAt?: string
  prevention?: string
  treatment?: string
}

export interface CreateMedicineRequest {
  name: string
  description?: string
  usageInstructions: string[]
  diseases?: string[]
}

export interface CreateAdviceRequest {
  detectionId?: string
  prescription: string
  medicineId?: string
}

export interface CreateFeedbackRequest {
  detectionId: string
  category: FeedbackCategory
  comment: string
  adviceId?: string
}

export interface CreateFeedbackResponseRequest {
  feedbackId: string
  message: string
}

export interface UpdateUserRoleRequest {
  role: Role
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
