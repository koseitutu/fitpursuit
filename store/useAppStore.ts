import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState, AppSettings, Streaks } from './types';
import {
  sampleWorkoutTemplates,
  sampleAchievements,
  sampleWeeklyStats,
  sampleWeeklyActivities,
} from './sample-data';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

const defaultStreaks: Streaks = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
};

const defaultSettings: AppSettings = {
  units: 'metric',
  notifications: true,
  reminderTime: '08:00',
  weeklyReport: true,
  soundEffects: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      userProfile: null,
      dailyStats: [],
      workouts: [],
      activities: [],
      weightLog: [],
      nutritionLog: [],
      achievements: sampleAchievements,
      streaks: defaultStreaks,
      workoutTemplates: sampleWorkoutTemplates,
      bloodPressureReadings: [],
      settings: defaultSettings,
      themeMode: 'dark',
      onboardingCompleted: false,
      activeActivity: null,

      // --- User Profile Actions ---
      setUserProfile: (profile) => {
        set({ userProfile: profile });
      },

      updateUserProfile: (updates) => {
        const current = get().userProfile;
        if (current) {
          set({
            userProfile: {
              ...current,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // --- Daily Stats Actions ---
      addDailyStats: (stats) => {
        set((state) => ({
          dailyStats: [...state.dailyStats, stats],
        }));
      },

      updateDailyStats: (date, updates) => {
        set((state) => ({
          dailyStats: state.dailyStats.map((s) =>
            s.date === date ? { ...s, ...updates } : s
          ),
        }));
      },

      getTodayStats: () => {
        const today = getTodayDate();
        return get().dailyStats.find((s) => s.date === today);
      },

      // --- Workout Actions ---
      addWorkout: (workout) => {
        set((state) => ({
          workouts: [workout, ...state.workouts],
        }));
      },

      updateWorkout: (id, updates) => {
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      deleteWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        }));
      },

      toggleFavoriteWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
          ),
        }));
      },

      // --- Activity Actions ---
      startActivity: (activity) => {
        set({ activeActivity: { ...activity, endedAt: null } });
      },

      endActivity: (id, updates) => {
        const active = get().activeActivity;
        if (active && active.id === id) {
          const completed = {
            ...active,
            ...updates,
            endedAt: new Date().toISOString(),
          };
          set((state) => ({
            activeActivity: null,
            activities: [completed, ...state.activities],
          }));
        }
      },

      addActivity: (activity) => {
        set((state) => ({
          activities: [activity, ...state.activities],
        }));
      },

      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        }));
      },

      // --- Weight Log Actions ---
      addWeightEntry: (entry) => {
        set((state) => {
          const existingIndex = state.weightLog.findIndex(
            (e) => e.date === entry.date
          );
          if (existingIndex >= 0) {
            const updatedLog = [...state.weightLog];
            updatedLog[existingIndex] = entry;
            return { weightLog: updatedLog };
          }
          return { weightLog: [...state.weightLog, entry] };
        });
      },

      // --- Nutrition Actions ---
      addMeal: (date, meal) => {
        set((state) => {
          const existing = state.nutritionLog.find((l) => l.date === date);
          if (existing) {
            return {
              nutritionLog: state.nutritionLog.map((l) =>
                l.date === date ? { ...l, meals: [...l.meals, meal] } : l
              ),
            };
          }
          return {
            nutritionLog: [
              ...state.nutritionLog,
              { date, meals: [meal], waterIntake: 0 },
            ],
          };
        });
      },

      updateWaterIntake: (date, amount) => {
        set((state) => {
          const existing = state.nutritionLog.find((l) => l.date === date);
          if (existing) {
            return {
              nutritionLog: state.nutritionLog.map((l) =>
                l.date === date ? { ...l, waterIntake: amount } : l
              ),
            };
          }
          return {
            nutritionLog: [
              ...state.nutritionLog,
              { date, meals: [], waterIntake: amount },
            ],
          };
        });
      },

      // --- Blood Pressure Actions ---
      addBloodPressureReading: (reading) => {
        set((state) => ({
          bloodPressureReadings: [reading, ...state.bloodPressureReadings],
        }));
      },

      updateBloodPressureReading: (id, updates) => {
        set((state) => ({
          bloodPressureReadings: state.bloodPressureReadings.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteBloodPressureReading: (id) => {
        set((state) => ({
          bloodPressureReadings: state.bloodPressureReadings.filter((r) => r.id !== id),
        }));
      },

      // --- Settings Actions ---
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // --- Achievement Actions ---
      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id
              ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      // --- Streak Actions ---
      updateStreak: () => {
        const today = getTodayDate();
        const streaks = get().streaks;

        if (streaks.lastActiveDate === today) return;

        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split('T')[0];
        const isConsecutive = streaks.lastActiveDate === yesterday;
        const newCurrent = isConsecutive ? streaks.currentStreak + 1 : 1;

        set({
          streaks: {
            currentStreak: newCurrent,
            longestStreak: Math.max(streaks.longestStreak, newCurrent),
            lastActiveDate: today,
          },
        });
      },

      // --- Theme Actions ---
      toggleTheme: () => {
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        }));
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      // --- Onboarding Actions ---
      completeOnboarding: () => {
        set({ onboardingCompleted: true });
      },

      // --- Import Actions ---
      importActivities: (newActivities) => {
        set((state) => ({
          activities: [...newActivities, ...state.activities],
        }));
      },

      importWorkouts: (newWorkouts) => {
        set((state) => ({
          workouts: [...newWorkouts, ...state.workouts],
        }));
      },

      importWeightLog: (entries) => {
        set((state) => {
          const existing = new Set(state.weightLog.map((e) => e.date));
          const newEntries = entries.filter((e) => !existing.has(e.date));
          return { weightLog: [...state.weightLog, ...newEntries] };
        });
      },

      importNutritionLog: (entries) => {
        set((state) => {
          const existing = new Set(state.nutritionLog.map((e) => e.date));
          const newEntries = entries.filter((e) => !existing.has(e.date));
          return { nutritionLog: [...state.nutritionLog, ...newEntries] };
        });
      },

      importBloodPressureReadings: (readings) => {
        set((state) => ({
          bloodPressureReadings: [...readings, ...state.bloodPressureReadings],
        }));
      },

      // --- Sample Data ---
      loadSampleData: () => {
        set({
          workoutTemplates: sampleWorkoutTemplates,
          achievements: sampleAchievements,
          dailyStats: sampleWeeklyStats,
          activities: sampleWeeklyActivities,
          streaks: {
            currentStreak: 5,
            longestStreak: 14,
            lastActiveDate: getTodayDate(),
          },
          weightLog: [
            { date: getTodayDate(), weight: 75, bmi: 23.4 },
          ],
        });
      },
    }),
    {
      name: 'fittrack-pro-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        dailyStats: state.dailyStats,
        workouts: state.workouts,
        activities: state.activities,
        weightLog: state.weightLog,
        nutritionLog: state.nutritionLog,
        achievements: state.achievements,
        streaks: state.streaks,
        workoutTemplates: state.workoutTemplates,
        bloodPressureReadings: state.bloodPressureReadings,
        settings: state.settings,
        themeMode: state.themeMode,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
