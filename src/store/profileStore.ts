import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

const INITIAL_PROFILE: UserProfile = {
  name: '',
  profession: '',
  niche: '',
  primaryPlatform: 'Twitter/X',
  postingGoals: [],
  contentVision: '',
  tone: '',
  contentFormats: [],
  onboardingComplete: false,
  createdAt: '',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : { ...INITIAL_PROFILE, ...updates },
        })),
      resetProfile: () => set({ profile: null }),
    }),
    {
      name: 'pulsr-profile',
    }
  )
);
