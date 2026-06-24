import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { WifiOff, Battery, Wifi, Cpu, Layers, Terminal, Copy, Check, Apple, Smartphone } from 'lucide-react';
import { useProfileStore } from './store/profileStore';
import { useThemeStore, applyTheme } from './store/themeStore';
import { useSystemStore } from './store/systemStore';

// Layout Imports
import { MobileNav, TabType } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Button } from './components/ui/Button';

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
  const { offlineResilientMode, mobileSimulated, setMobileSimulated, simulatedPlatform, setSimulatedPlatform } = useSystemStore();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [onboardingPanel, setOnboardingPanel] = useState(true);
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('pulsr-hide-landing'));

  // Prefills targeting the Suggest Generation screen
  const [prefilledTopic, setPrefilledTopic] = useState('');
  
  // Offline detection states
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

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
              localStorage.removeItem('pulsr-hide-landing');
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

  if (mobileSimulated) {
    return (
      <div className="min-h-screen bg-bg text-text-main antialiased font-sans transition-colors duration-250 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Capacitor Native Studio Control Panel (Desktop viewports only) */}
        <div className="hidden md:flex w-full md:w-80 lg:w-[350px] shrink-0 border-r border-border-accent/30 bg-surface/30 backdrop-blur-xl p-5 flex-col justify-between h-screen overflow-y-auto select-none">
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-accent font-extrabold">Capacitor Studio</span>
              </div>
              <h2 className="text-lg font-syne font-bold text-text-main">
                Mobile Native Hub
              </h2>
              <p className="text-[11px] text-muted leading-relaxed">
                Build and simulate your web app as a native mobile container.
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block">Simulated Platform</label>
              <div className="grid grid-cols-2 gap-1.5 bg-card/60 p-1 rounded-xl border border-border-accent/30">
                <button
                  onClick={() => setSimulatedPlatform('ios')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    simulatedPlatform === 'ios'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-text-main'
                  }`}
                >
                  <Apple className="h-3.5 w-3.5" /> Apple iOS
                </button>
                <button
                  onClick={() => setSimulatedPlatform('android')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    simulatedPlatform === 'android'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-text-main'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Android
                </button>
              </div>
            </div>

            {/* Native API Simulator */}
            <div className="bg-card/40 border border-border-accent/25 rounded-xl p-3.5 space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase font-mono tracking-wider text-muted flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" /> Simulating Native APIs
              </h3>
              
              <div className="space-y-2">
                {/* Haptics */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                    <span className="text-muted">Haptics:</span>
                    <span className="text-accent font-bold">Capacitor.Haptics</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (window.navigator.vibrate) {
                        window.navigator.vibrate([100]);
                      }
                      toast.success(`Haptic ${simulatedPlatform === 'ios' ? 'Taptic' : 'Vibe'} simulation!`);
                    }}
                    variant="ghost"
                    className="w-full h-7 text-[10px] font-mono bg-bg/50 hover:bg-bg border border-border-accent/30 rounded-lg justify-center"
                  >
                    Vibrate Device
                  </Button>
                </div>

                {/* Sharing */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                    <span className="text-muted">Share Sheet:</span>
                    <span className="text-accent font-bold">Capacitor.Share</span>
                  </div>
                  <Button
                    onClick={() => {
                      toast.success(`Mock Capacitor Share triggered!`);
                    }}
                    variant="ghost"
                    className="w-full h-7 text-[10px] font-mono bg-bg/50 hover:bg-bg border border-border-accent/30 rounded-lg justify-center"
                  >
                    Deploy Native Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Terminal Command Copier */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block">Terminal CLI Scripts</label>
                <Terminal className="h-3 w-3 text-muted" />
              </div>
              <div className="space-y-2 bg-card/60 p-2.5 rounded-xl border border-border-accent/30">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-mono text-muted text-[10px] border-b border-border-accent/15 pb-0.5">
                    <span>Vite Build & Sync</span>
                    <button onClick={() => copyToClipboard('npm run build && npx cap sync')} className="hover:text-text-main flex items-center gap-1">
                      {copiedCmd === 'npm run build && npx cap sync' ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                  <code className="block text-[9px] font-mono text-accent bg-bg/50 p-1.5 rounded select-all">
                    npm run build && npx cap sync
                  </code>
                </div>

                <div className="space-y-1 text-xs pt-1">
                  <div className="flex justify-between items-center font-mono text-muted text-[10px] border-b border-border-accent/15 pb-0.5">
                    <span>Launch Native IDE</span>
                    <button onClick={() => copyToClipboard(`npx cap open ${simulatedPlatform}`)} className="hover:text-text-main flex items-center gap-1">
                      {copiedCmd === `npx cap open ${simulatedPlatform}` ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                  <code className="block text-[9px] font-mono text-accent bg-bg/50 p-1.5 rounded select-all">
                    npx cap open {simulatedPlatform}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Exit */}
          <div className="pt-4 border-t border-border-accent/20 space-y-2">
            <Button
              onClick={() => setMobileSimulated(false)}
              className="w-full text-xs py-1.5 justify-center font-semibold bg-accent text-white"
            >
              Exit Simulator Mode
            </Button>
            <div className="text-[9px] text-muted text-center font-mono flex items-center justify-center gap-1">
              <Layers className="h-3 w-3 text-accent" /> com.pulsr.app • Capacitor Ready
            </div>
          </div>
        </div>

        {/* Right Side: Phone Frame Stage */}
        <div className="flex-1 bg-bg/95 flex flex-col items-center justify-center p-2 relative overflow-y-auto min-h-screen select-none">
          {/* Back button for mobile preview screens where sidebar is missing */}
          <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
            <Button
              onClick={() => setMobileSimulated(false)}
              variant="ghost"
              className="text-xs bg-surface/50 border border-border-accent/20 md:hidden font-mono flex gap-1"
            >
              Exit Simulator
            </Button>
            <div className="bg-surface/50 border border-border-accent/20 rounded-full px-2.5 py-1 text-[10px] text-muted flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span className="font-mono">{simulatedPlatform.toUpperCase()} Pre-compiler live</span>
            </div>
          </div>

          {/* Device Outer Frame */}
          <div className="relative my-4 mx-auto rounded-[48px] border-[10px] border-slate-800 dark:border-slate-700 bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.45)] w-[340px] h-[690px] flex flex-col overflow-hidden transition-all duration-300">
            {/* Phone Notch / Island */}
            {simulatedPlatform === 'ios' ? (
              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700/50 mr-1.5" />
                <div className="w-1 h-1 rounded-full bg-blue-900/30" />
              </div>
            ) : (
              <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-900 rounded-full z-50 border border-slate-800 flex items-center justify-center" />
            )}

            {/* Simulated Native Status Bar */}
            <div className="h-8 bg-surface px-5 pt-1.5 flex justify-between items-center text-[10px] font-sans font-extrabold select-none z-40 shrink-0 border-b border-border-accent/5">
              <span className="font-mono">{currentTimeStr || '09:41'}</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-text-main" />
                <span className="text-[8px] font-mono">5G</span>
                <Battery className="h-3 w-3 text-text-main" />
              </div>
            </div>

            {/* Inner App Frame */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-bg text-text-main select-none">
              {/* Header inside device */}
              <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Main view content in device */}
              <div className="flex-1 p-2 pb-24 relative">
                {renderTabContent()}
              </div>
              
              {/* Floating mobile nav inside device */}
              <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* iOS Bottom Swipe Bar Indicator */}
            {simulatedPlatform === 'ios' && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-28 h-0.5 bg-slate-400 dark:bg-slate-600 rounded-full z-50 select-none pointer-events-none" />
            )}
          </div>
        </div>
      </div>
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
