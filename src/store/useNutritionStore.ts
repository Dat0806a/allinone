import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface DayLog {
  breakfast: MealItem[];
  lunch: MealItem[];
  snack: MealItem[];
  dinner: MealItem[];
}

interface NutritionState {
  logsByUser: Record<string, Record<string, DayLog>>; // Key: userId -> "YYYY-MM-DD"
  selectedDate: string; // "YYYY-MM-DD"
  targetCalories: number;
  setSelectedDate: (date: string) => void;
  setTargetCalories: (calories: number) => void;
  addMealItem: (
    userId: string,
    dateString: string,
    session: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    item: Omit<MealItem, 'id'>
  ) => void;
  updateMealItem: (
    userId: string,
    dateString: string,
    session: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    itemId: string,
    item: Partial<Omit<MealItem, 'id'>>
  ) => void;
  deleteMealItem: (
    userId: string,
    dateString: string,
    session: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    itemId: string
  ) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set) => ({
      logsByUser: {},
      selectedDate: new Date().toISOString().split('T')[0],
      targetCalories: 2000,

      setSelectedDate: (date) => set({ selectedDate: date }),
      setTargetCalories: (targetCalories) => set({ targetCalories }),

      addMealItem: (userId, dateString, session, item) =>
        set((state) => {
          const userLogs = state.logsByUser[userId] || {};
          const dayLog = userLogs[dateString] || { breakfast: [], lunch: [], snack: [], dinner: [] };

          const newItem: MealItem = {
            ...item,
            id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          const updatedDayLog = {
            ...dayLog,
            [session]: [newItem, ...dayLog[session]],
          };

          return {
            logsByUser: {
              ...state.logsByUser,
              [userId]: {
                ...userLogs,
                [dateString]: updatedDayLog
              }
            }
          };
        }),

      updateMealItem: (userId, dateString, session, itemId, updatedDetails) =>
        set((state) => {
          const userLogs = state.logsByUser[userId];
          if (!userLogs || !userLogs[dateString]) return {};

          const dayLog = userLogs[dateString];
          const updatedDayLog = {
            ...dayLog,
            [session]: dayLog[session].map((item) =>
              item.id === itemId ? { ...item, ...updatedDetails } : item
            ),
          };

          return {
            logsByUser: {
              ...state.logsByUser,
              [userId]: {
                ...userLogs,
                [dateString]: updatedDayLog
              }
            }
          };
        }),

      deleteMealItem: (userId, dateString, session, itemId) =>
        set((state) => {
          const userLogs = state.logsByUser[userId];
          if (!userLogs || !userLogs[dateString]) return {};

          const dayLog = userLogs[dateString];
          const updatedDayLog = {
            ...dayLog,
            [session]: dayLog[session].filter((item) => item.id !== itemId),
          };

          return {
            logsByUser: {
              ...state.logsByUser,
              [userId]: {
                ...userLogs,
                [dateString]: updatedDayLog
              }
            }
          };
        }),
    }),
    {
      name: 'nutrition-storage-v2', // bump version
    }
  )
);
