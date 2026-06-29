import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentSuggestion } from '../types';

interface ContentState {
  suggestions: ContentSuggestion[];
  autoClearDays: number; // 0 = never, 1 = 1 day, 3 = 3 days, 7 = 7 days
  clearCacheOnExit: boolean;
  addSuggestion: (suggestion: ContentSuggestion) => void;
  updateSuggestion: (id: string, updated: Partial<ContentSuggestion>) => void;
  deleteSuggestion: (id: string) => void;
  clearSuggestions: () => void;
  setAutoClearDays: (days: number) => void;
  setClearCacheOnExit: (enabled: boolean) => void;
  cleanupOldSuggestions: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      suggestions: [],
      autoClearDays: 3, // Default retention of 3 days
      clearCacheOnExit: false, // Default to false
      addSuggestion: (suggestion) =>
        set((state) => {
          // Prepend the new suggestion
          let newSuggestions = [suggestion, ...state.suggestions];
          
          // Apply automatic age filter if setting is active
          if (state.autoClearDays > 0) {
            const now = Date.now();
            const limitMs = state.autoClearDays * 24 * 60 * 60 * 1000;
            newSuggestions = newSuggestions.filter((item) => {
              const createdTime = new Date(item.createdAt).getTime();
              return now - createdTime <= limitMs;
            });
          }

          // Keep max 50 items
          if (newSuggestions.length > 50) {
            newSuggestions = newSuggestions.slice(0, 50);
          }
          return { suggestions: newSuggestions };
        }),
      updateSuggestion: (id, updated) =>
        set((state) => ({
          suggestions: state.suggestions.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        })),
      deleteSuggestion: (id) =>
        set((state) => ({
          suggestions: state.suggestions.filter((item) => item.id !== id),
        })),
      clearSuggestions: () => set({ suggestions: [] }),
      setClearCacheOnExit: (enabled) => set({ clearCacheOnExit: enabled }),
      setAutoClearDays: (days) =>
        set((state) => {
          let newSuggestions = state.suggestions;
          if (days > 0) {
            const now = Date.now();
            const limitMs = days * 24 * 60 * 60 * 1000;
            newSuggestions = state.suggestions.filter((item) => {
              const createdTime = new Date(item.createdAt).getTime();
              return now - createdTime <= limitMs;
            });
          }
          return { autoClearDays: days, suggestions: newSuggestions };
        }),
      cleanupOldSuggestions: () =>
        set((state) => {
          if (state.autoClearDays === 0) return {};
          const now = Date.now();
          const limitMs = state.autoClearDays * 24 * 60 * 60 * 1000;
          const filtered = state.suggestions.filter((item) => {
            const createdTime = new Date(item.createdAt).getTime();
            return now - createdTime <= limitMs;
          });
          if (filtered.length !== state.suggestions.length) {
            return { suggestions: filtered };
          }
          return {};
        }),
    }),
    {
      name: 'pulsr-content',
    }
  )
);
