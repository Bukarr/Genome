import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarItem } from '../types';

interface CalendarState {
  items: CalendarItem[];
  addItems: (items: CalendarItem[]) => void;
  addItem: (item: CalendarItem) => void;
  updateItem: (id: string, updated: Partial<CalendarItem>) => void;
  deleteItem: (id: string) => void;
  clearCalendar: () => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      items: [],
      addItems: (newItems) =>
        set((state) => {
          // Merge items, avoiding exact duplicate IDs if any
          const existingIds = new Set(state.items.map((i) => i.id));
          const filteredNew = newItems.filter((i) => !existingIds.has(i.id));
          return { items: [...state.items, ...filteredNew] };
        }),
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      updateItem: (id, updated) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCalendar: () => set({ items: [] }),
    }),
    {
      name: 'pulsr-calendar',
    }
  )
);
