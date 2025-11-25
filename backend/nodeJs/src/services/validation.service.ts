import { AgeRange } from "../types/profile.types";

class ValidationService {
  private static readonly VALID_AGE_RANGES: AgeRange[] = [
    "10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대+"
  ];

  static validateHeight(height: number): boolean {
    return height >= 50 && height <= 300;
  }

  static validateWeight(weight: number): boolean {
    return weight >= 20 && weight <= 300;
  }

  static validateAgeRange(ageRange: string): ageRange is AgeRange {
    return this.VALID_AGE_RANGES.includes(ageRange as AgeRange);
  }

  static validateStringArray(arr: any): arr is string[] {
    return Array.isArray(arr) && arr.every(item => typeof item === 'string');
  }

  static sanitizeString(str: string): string {
    return str.trim().toLowerCase();
  }
}

export default ValidationService;
