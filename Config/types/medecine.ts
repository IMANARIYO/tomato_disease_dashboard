export interface Disease {
  id: string;
  name: string;
  description: string;
  scientificName: string;
  symptoms: string | null;
  severity: "Low" | "Medium" | "High";
  prevention: string | null;
  treatment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  usageInstructions: string[];
  createdAt: string;
  updatedAt: string;
  diseases: Disease[];
}

export interface MedicineResponse {
  success: boolean;
  message: string;
  data: Medicine[];
}
