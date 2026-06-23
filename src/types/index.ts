export interface UserProfile {
  name: string;
  profession: string;
  niche: string;
  primaryPlatform: string;
  postingGoals: string[];
  contentVision: string; // free-form textarea — the most important field
  tone: string;
  contentFormats: string[];
  onboardingComplete: boolean;
  createdAt: string;
  geolocation?: string;
}

export interface ContentSuggestion {
  id: string;
  headline: string;
  content: string;
  hashtags: string[];
  tip: string;
  bestTimeToPost: string;
  engagementHook: string;
  platform: string;
  format: string;
  createdAt: string;
}

export interface TrendItem {
  topic: string;
  summary: string;
  momentum: 'hot' | 'rising';
  relevanceReason: string;
  contentAngle: string;
}

export interface CalendarItem {
  id: string;
  date: string; // YYYY-MM-DD;
  platform: string;
  format: string;
  topic: string;
  headline: string;
  status: 'planned' | 'draft' | 'posted';
  priority: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
