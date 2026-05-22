// FitTrack Pro - TypeScript Types

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'improve_endurance'
  | 'increase_flexibility'
  | 'maintain_fitness'
  | 'gain_strength';

export type WorkoutCategory =
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'crossfit'
  | 'swimming'
  | 'cycling'
  | 'running';

export type ActivityType =
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'hiking';

export type ThemeMode = 'dark' | 'light';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  fitnessLevel: FitnessLevel;
  fitnessGoals: FitnessGoal[];
  dailyCalorieTarget: number;
  dailyStepGoal: number;
  dailyWaterGoal: number; // in ml
  avatarUri: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyStats {
  date: string; // ISO date string YYYY-MM-DD
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  waterIntake: number; // in ml
  distanceTraveled: number; // in km
  goalCompletionRate: number; // 0-100
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number; // in kg
  isCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  restTime: number; // in seconds
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  duration: number; // in minutes
  exercises: Exercise[];
  caloriesBurned: number;
  notes: string;
  isFavorite: boolean;
  completedAt: string; // ISO string
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  duration: number; // in minutes
  distance: number; // in km
  steps: number;
  pace: number; // min/km
  caloriesBurned: number;
  route: RoutePoint[];
  startedAt: string; // ISO string
  endedAt: string | null; // ISO string, null if in progress
}

export interface WeightEntry {
  date: string; // ISO date YYYY-MM-DD
  weight: number; // in kg
  bmi: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface NutritionLog {
  date: string; // ISO date YYYY-MM-DD
  meals: Meal[];
  waterIntake: number; // in ml
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null; // ISO string, null if locked
  isUnlocked: boolean;
}

export interface Streaks {
  currentStreak: number; // in days
  longestStreak: number; // in days
  lastActiveDate: string; // ISO date YYYY-MM-DD
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: WorkoutCategory;
  exercises: Exercise[];
  estimatedDuration: number; // in minutes
  difficulty: Difficulty;
  isCustom: boolean;
  isFavorite: boolean;
}

export interface AppState {
  // Data
  userProfile: UserProfile | null;
  dailyStats: DailyStats[];
  workouts: Workout[];
  activities: Activity[];
  weightLog: WeightEntry[];
  nutritionLog: NutritionLog[];
  achievements: Achievement[];
  streaks: Streaks;
  workoutTemplates: WorkoutTemplate[];
  themeMode: ThemeMode;
  onboardingCompleted: boolean;
  activeActivity: Activity | null;

  // User Profile Actions
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Daily Stats Actions
  addDailyStats: (stats: DailyStats) => void;
  updateDailyStats: (date: string, updates: Partial<DailyStats>) => void;
  getTodayStats: () => DailyStats | undefined;

  // Workout Actions
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  toggleFavoriteWorkout: (id: string) => void;

  // Activity Actions
  startActivity: (activity: Omit<Activity, 'endedAt'>) => void;
  endActivity: (id: string, updates: Partial<Activity>) => void;
  addActivity: (activity: Activity) => void;

  // Weight Log Actions
  addWeightEntry: (entry: WeightEntry) => void;

  // Nutrition Actions
  addMeal: (date: string, meal: Meal) => void;
  updateWaterIntake: (date: string, amount: number) => void;

  // Achievement Actions
  unlockAchievement: (id: string) => void;

  // Streak Actions
  updateStreak: () => void;

  // Theme Actions
  toggleTheme: () => void;

  // Onboarding Actions
  completeOnboarding: () => void;

  // Sample Data
  loadSampleData: () => void;
}
