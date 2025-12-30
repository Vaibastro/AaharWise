
export enum ActivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface UserProfile {
  age: number;
  gender: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  conditions: string;
}

export interface Nutrients {
  calories: number;
  carbs: number;
  protein: number;
  fiber: number;
  fats: number;
}

export interface Meal {
  id: string;
  time: string;
  food: string;
  portion: string;
  isJunk: boolean;
  isHomeCooked: boolean;
  nutrients?: Nutrients;
  imageUrl?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  meals: Meal[];
  waterMl: number;
  profileSnapshot: UserProfile;
  analysis?: string;
  totalNutrients?: Nutrients;
}

export interface HistorySummary {
  avgFiber: string;
  junkFrequency: string;
  waterConsistency: string;
}
