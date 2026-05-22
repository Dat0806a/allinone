import { create } from 'zustand';

interface UserState {
  user: any | null;
  setUser: (user: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  loading: true,
  setLoading: (loading) => set({ loading }),
}));

interface HealthState {
  profile: any | null;
  setProfile: (profile: any) => void;
  medications: any[];
  setMedications: (meds: any[]) => void;
  schedules: any[];
  setSchedules: (schedules: any[]) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  medications: [],
  setMedications: (medications) => set({ medications }),
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
}));

interface AppState {
  isEmergency: boolean;
  setIsEmergency: (isEmergency: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingSearchQuery: string | null;
  setPendingSearchQuery: (query: string | null) => void;
  shouldOpenPostModal: boolean;
  setShouldOpenPostModal: (shouldOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isEmergency: false,
  setIsEmergency: (isEmergency) => set({ isEmergency }),
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),
  pendingSearchQuery: null,
  setPendingSearchQuery: (pendingSearchQuery) => set({ pendingSearchQuery }),
  shouldOpenPostModal: false,
  setShouldOpenPostModal: (shouldOpenPostModal) => set({ shouldOpenPostModal }),
}));
