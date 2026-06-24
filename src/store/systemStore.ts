import { create } from 'zustand';

interface SystemState {
  offlineResilientMode: boolean;
  setOfflineResilientMode: (val: boolean) => void;
  mobileSimulated: boolean;
  setMobileSimulated: (val: boolean) => void;
  simulatedPlatform: 'ios' | 'android';
  setSimulatedPlatform: (val: 'ios' | 'android') => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  offlineResilientMode: false,
  setOfflineResilientMode: (val) => set({ offlineResilientMode: val }),
  mobileSimulated: false,
  setMobileSimulated: (val) => set({ mobileSimulated: val }),
  simulatedPlatform: 'ios',
  setSimulatedPlatform: (val) => set({ simulatedPlatform: val }),
}));
