import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AnalyticsEvent {
  id: string;
  eventType: 'content_generation' | 'trend_view' | 'calendar_interaction' | 'chat_usage';
  description: string;
  timestamp: string;
  meta?: Record<string, any>;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  trackEvent: (
    eventType: 'content_generation' | 'trend_view' | 'calendar_interaction' | 'chat_usage',
    description: string,
    meta?: Record<string, any>
  ) => void;
  clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      events: [],
      trackEvent: (eventType, description, meta) =>
        set((state) => {
          const newEvent: AnalyticsEvent = {
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            eventType,
            description,
            timestamp: new Date().toISOString(),
            meta,
          };
          const updatedEvents = [newEvent, ...state.events].slice(0, 200);
          return { events: updatedEvents };
        }),
      clearAnalytics: () => set({ events: [] }),
    }),
    {
      name: 'genome-analytics',
    }
  )
);
