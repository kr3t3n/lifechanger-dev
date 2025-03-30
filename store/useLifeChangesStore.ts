import { create } from 'zustand';

export interface LifeChange {
  id: string;
  type: 'start' | 'stop';
  name: string;
  date: string;
  impact?: {
    value: number;
    type: 'positive' | 'negative';
  };
}

interface DailyData {
  date: string;
  high: number;
  low: number;
}

interface LifeChangesState {
  changes: LifeChange[];
  bodyBatteryData: DailyData[];
  isAuthenticated: boolean;
  addChange: (change: Omit<LifeChange, 'id'>) => void;
  getLatestChange: () => LifeChange | null;
  setBodyBatteryData: (data: DailyData[]) => void;
  setAuthenticated: (status: boolean) => void;
}

export const useLifeChangesStore = create<LifeChangesState>((set, get) => ({
  changes: [],
  bodyBatteryData: [],
  isAuthenticated: false,
  addChange: (change) => set((state) => ({
    changes: [{ ...change, id: Date.now().toString() }, ...state.changes]
  })),
  getLatestChange: () => {
    const { changes } = get();
    if (changes.length === 0) return null;
    return changes[0];
  },
  setBodyBatteryData: (data) => set({ bodyBatteryData: data }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
}));