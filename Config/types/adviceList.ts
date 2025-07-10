
export interface AdviceListResponse {
  success: boolean;
  message: string;
  data: AdviceItem[];
}

export interface AdviceItem {
  id: string;
  prescription: string;
  createdAt: string; // ISO date string
  detection: Detection;
  agronomist: Agronomist;
  medicine: Medicine | null;
}

export interface Detection {
  id: string;
  disease: Disease;
  farmer: Farmer;
}

export interface Disease {
  id: string;
  name: string;
  description: string;
  scientificName: string | null;
  symptoms: string | null;
  severity: string;
  prevention: string | null;
  treatment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Farmer {
  id: string;
  user: User;
}

export interface Agronomist {
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  usageInstructions: string[];
  createdAt: string;
  updatedAt: string;
}
