import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentSuggestion } from '../types';

interface ContentState {
  suggestions: ContentSuggestion[];
  addSuggestion: (suggestion: ContentSuggestion) => void;
  updateSuggestion: (id: string, updated: Partial<ContentSuggestion>) => void;
  deleteSuggestion: (id: string) => void;
  clearSuggestions: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      suggestions: [],
      addSuggestion: (suggestion) =>
        set((state) => {
          // Prepend the new suggestion
          const newSuggestions = [suggestion, ...state.suggestions];
          // Keep max 50 items
          if (newSuggestions.length > 50) {
            newSuggestions.pop(); // Drop oldest which is at the end
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
    }),
    {
      name: 'genome-content',
    }
  )
);
