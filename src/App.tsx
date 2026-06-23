import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { WifiOff } from 'lucide-react';
import { useProfileStore } from './store/profileStore';
import { useThemeStore, applyTheme } from './store/themeStore';

// Layout Imports
import { MobileNav, TabType } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// View/Feature Imports
import { OnboardingView } from './components/features/OnboardingView';
import { WelcomeLandingView } from './components/features/WelcomeLandingView';
import { DashboardView } from './components/features/DashboardView';
import { SuggestView } from './components/features/SuggestView';
import { TrendsView } from './components/features/TrendsView';
import { CalendarView } from './components/features/CalendarView';
import { ChatView } from './components/features/ChatView';
import { SettingsView } from './components/features/SettingsView';

export default function App() {
  const { profile } = useProfileStore();
  const { theme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [onboardingPanel, setOnboardingPanel] = useState(true);
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('genome-hide-landing'));

  // Prefills targeting the Suggest Generation screen
  const [prefilledTopic, setPrefilledTopic] = useState('');
  
  // Offline detection states
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  useEffect(() => {
    // Initial and reactive theme binding
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine if onboarding setup needs viewing on mount
  useEffect(() => {
    if (profile?.onboardingComplete) {
      setOnboardingPanel(false);
    } else {
      setOnboardingPanel(true);
    }
  }, [profile]);

  // Navigate & Pre-fill utility
  const handleNavigateToSuggestWithTopic = (tab: TabType, topicText?: string) => {
    if (topicText) {
      setPrefilledTopic(topicText);
    }
    setActiveTab(tab);
  };

  // Scheduled calendar generate items pre-fill
  const handleDraftPostFromSchedule = (platform: string, format: string, topic: string) => {
    // Navigates directly to content suggestions, pre-fills topic
    setPrefilledTopic(`Topic: ${topic} [Platform Target: ${platform}, Size: ${format}]`);
    setActiveTab('suggest');
  };

  // Layout Route Switch
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardView onNavigate={handleNavigateToSuggestWithTopic} />;
      case 'suggest':
        return (
          <SuggestView
            prefilledTopic={prefilledTopic}
            clearPrefilledTopic={() => setPrefilledTopic('')}
          />
        );
      case 'trends':
        return (
          <TrendsView
            onNavigateToSuggest={(topic) => handleNavigateToSuggestWithTopic('suggest', topic)}
          />
        );
      case 'calendar':
        return <CalendarView onDraftPost={handleDraftPostFromSchedule} />;
      case 'chat':
        return <ChatView />;
      case 'settings':
        return (
          <SettingsView 
            onReset={() => {
              localStorage.removeItem('genome-hide-landing');
              setShowLanding(true);
              setOnboardingPanel(true);
            }} 
          />
        );
      default:
        return <DashboardView onNavigate={handleNavigateToSuggestWithTopic} />;
    }
  };

  if (showLanding) {
    return (
      <>
        <WelcomeLandingView 
          hasProfile={!!profile?.onboardingComplete}
          onEnterWorkspace={() => {
            setShowLanding(false);
            setOnboardingPanel(false);
          }}
          onStartOnboarding={() => {
            setShowLanding(false);
            setOnboardingPanel(true);
          }}
        />
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      </>
    );
  }

  if (onboardingPanel) {
    return (
      <>
        <OnboardingView onComplete={() => setOnboardingPanel(false)} />
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-bg glowing-bg text-text-main antialiased font-sans transition-colors duration-250">
      {/* 1. Offline Banner */}
      {isOffline && (
        <div className="bg-error text-bg font-mono text-center py-2 px-4 text-xs font-bold flex items-center justify-center gap-1.5 sticky top-0 z-50 animate-bounce select-none">
          <WifiOff className="h-4 w-4" /> YOU ARE CURRENTLY OFFLINE. WORKING WITH LOCAL PERSISTED CACHES.
        </div>
      )}

      {/* 2. Desktop sidebar layout container */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. Main content frame right of fixed sidebar */}
      <div className="md:pl-60 min-h-screen flex flex-col justify-between">
        <div className="flex-1 flex flex-col animate-fade-in">
          {/* Header TopBar */}
          <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Actual responsive workspace view - bottom padded to handle floating nav on mobile */}
          <main className="flex-1 p-4 pb-28 md:p-8 max-w-5xl w-full mx-auto select-none mt-2">
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* 4. Mobile Bottom Nav controls */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Alerts layer */}
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}
