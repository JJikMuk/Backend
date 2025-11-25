export type AgeRange = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대" | "80대+";

export interface UserProfile {
  id: string;
  userId: string;
  height: number;
  weight: number;
  ageRange: AgeRange;
  allergies: string[];
  diseases: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileRequest {
  height: number;
  weight: number;
  ageRange: AgeRange;
  allergies?: string[];
  diseases?: string[];
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}
