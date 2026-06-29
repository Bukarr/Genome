import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { WifiOff, Battery, Wifi, Cpu, Layers, Terminal, Copy, Check, Apple, Smartphone, Download, X, Share, Lock, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfileStore } from './store/profileStore';
import { useThemeStore, applyTheme } from './store/themeStore';
import { useSystemStore } from './store/systemStore';
import { useContentStore } from './store/contentStore';

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
import { SplashScreen } from './components/ui/SplashScreen';

export default function App() {
  const { profile } = useProfileStore();
  const { theme, toggleTheme } = useThemeStore();
  const { offlineResilientMode, mobileSimulated, setMobileSimulated, simulatedPlatform, setSimulatedPlatform } = useSystemStore();
  const { clearSuggestions, clearCacheOnExit } = useContentStore();

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [onboardingPanel, setOnboardingPanel] = useState(true);
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('pulsr-hide-landing'));

  // PWA Install & manual trigger states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Prefills targeting the Suggest Generation screen
  const [prefilledTopic, setPrefilledTopic] = useState('');
  const [prefilledPlatform, setPrefilledPlatform] = useState('');
  
  // Premium Simulator Customizations
  const [deviceType, setDeviceType] = useState<'iphone' | 'galaxy' | 'pixel'>('iphone');
  const [deviceColor, setDeviceColor] = useState<'titanium' | 'obsidian' | 'gold' | 'emerald'>('titanium');
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'wifi' | '5g' | 'offline'>('5g');
  const [isLandscape, setIsLandscape] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [showVolumeUI, setShowVolumeUI] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  
  // Offline detection states
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('09:41');

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /ipad|iphone|ipod/.test(ua) && !(window as any).MSStream;
    setIsIosDevice(isIos);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if not previously dismissed in this session
      if (!sessionStorage.getItem('pulsr-install-dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already in standalone mode, suppress standard prompt banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User accepted installation outcome: ${outcome}`);
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      } catch (err) {
        console.warn('Error launching install prompt:', err);
      }
    } else if (isIosDevice) {
      setShowIosGuide(true);
      setShowInstallBanner(false);
    } else {
      // Development or unsupported browser fallback
      toast.success("Successfully installed Pulsr onto your desktop screen!");
      setShowInstallBanner(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showVolumeUI) {
      const t = setTimeout(() => setShowVolumeUI(false), 1500);
      return () => clearTimeout(t);
    }
  }, [showVolumeUI]);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setBatteryLevel(Math.round(batt.level * 100));
        setIsCharging(batt.charging);
        
        const onLevelChange = () => setBatteryLevel(Math.round(batt.level * 100));
        const onChargeChange = () => setIsCharging(batt.charging);
        
        batt.addEventListener('levelchange', onLevelChange);
        batt.addEventListener('chargingchange', onChargeChange);
      }).catch(() => {});
    }
  }, []);

  // Clear Content on Exit (when switching tabs)
  useEffect(() => {
    if (clearCacheOnExit) {
      clearSuggestions();
    }
  }, [activeTab, clearCacheOnExit, clearSuggestions]);

  // Clear Content on Exit (when closing the application)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (clearCacheOnExit) {
        clearSuggestions();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clearCacheOnExit, clearSuggestions]);

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
  const handleNavigateToSuggestWithTopic = (tab: TabType, topicText?: string, platformText?: string) => {
    if (topicText) {
      setPrefilledTopic(topicText);
    }
    if (platformText) {
      setPrefilledPlatform(platformText);
    }
    setActiveTab(tab);
  };

  // Scheduled calendar generate items pre-fill
  const handleDraftPostFromSchedule = (platform: string, format: string, topic: string) => {
    // Navigates directly to content suggestions, pre-fills topic
    setPrefilledTopic(`Topic: ${topic} [Platform Target: ${platform}, Size: ${format}]`);
    setPrefilledPlatform(platform);
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
            prefilledPlatform={prefilledPlatform}
            clearPrefilledPlatform={() => setPrefilledPlatform('')}
          />
        );
      case 'trends':
        return (
          <TrendsView
            onNavigateToSuggest={(topic, platform) => handleNavigateToSuggestWithTopic('suggest', topic, platform)}
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

  if (showSplash) {
    return (
      <>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </>
    );
  }

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
                <span className="text-[9px] uppercase tracking-widest font-mono text-accent font-extrabold">Capacitor Studio v3.5</span>
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
                  onClick={() => {
                    setSimulatedPlatform('ios');
                    setDeviceType('iphone');
                  }}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    simulatedPlatform === 'ios'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-text-main'
                  }`}
                >
                  <Apple className="h-3.5 w-3.5" /> Apple iOS
                </button>
                <button
                  onClick={() => {
                    setSimulatedPlatform('android');
                    setDeviceType('galaxy');
                  }}
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

            {/* Hardware Chassis Customization */}
            <div className="space-y-2.5 bg-card/30 border border-border-accent/20 rounded-xl p-3">
              <h3 className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-muted">
                Hardware Customizer
              </h3>
              
              {/* Device Selector */}
              <div className="space-y-1">
                <span className="text-[10px] text-muted font-mono">Device Model</span>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as any)}
                  className="w-full bg-bg border border-border-accent/45 text-text-main rounded-lg text-xs py-1 px-2 font-mono focus:border-accent outline-none cursor-pointer"
                >
                  <option value="iphone">iPhone 15 Pro (Dynamic Island)</option>
                  <option value="galaxy">Samsung S24 (Sleek Bezel)</option>
                  <option value="pixel">Google Pixel 8 Pro (Curved Bezel)</option>
                </select>
              </div>

              {/* Chassis Color */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-muted font-mono">Chassis Armor Color</span>
                <div className="flex gap-2 items-center">
                  {[
                    { id: 'titanium', label: 'Titanium', bg: 'bg-slate-500 border-slate-400' },
                    { id: 'obsidian', label: 'Obsidian', bg: 'bg-slate-900 border-slate-800' },
                    { id: 'gold', label: 'Champagne', bg: 'bg-amber-600 border-amber-500' },
                    { id: 'emerald', label: 'Alpine', bg: 'bg-teal-800 border-teal-700' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setDeviceColor(color.id as any)}
                      title={color.label}
                      className={`h-6 w-6 rounded-full border-2 ${color.bg} transition-all active:scale-90 ${
                        deviceColor === color.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-110' : 'opacity-85 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Screen Orientation */}
              <div className="flex justify-between items-center pt-2 border-t border-border-accent/15">
                <span className="text-[10px] text-muted font-mono">Landscape Orientation</span>
                <button
                  onClick={() => setIsLandscape(!isLandscape)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 outline-none ${
                    isLandscape ? 'bg-accent' : 'bg-border-accent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                    isLandscape ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Simulated Sensors / Systems */}
            <div className="bg-card/40 border border-border-accent/25 rounded-xl p-3.5 space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase font-mono tracking-wider text-muted flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" /> System Mock Controls
              </h3>
              
              <div className="space-y-2.5">
                {/* Battery percentage */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-muted">
                    <span>Battery Status:</span>
                    <span className="text-bright font-bold">{batteryLevel}% {isCharging ? '(Charging)' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={batteryLevel}
                    onChange={(e) => setBatteryLevel(Number(e.target.value))}
                    className="w-full accent-accent bg-bg/50 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <label className="flex items-center gap-1.5 mt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCharging}
                      onChange={(e) => setIsCharging(e.target.checked)}
                      className="rounded border-border-accent/50 bg-bg text-accent focus:ring-accent w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[9px] text-muted font-mono">Simulate plug-in power (Charging)</span>
                  </label>
                </div>

                {/* Connection Speed */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted font-mono block">Simulate Carrier Speed</span>
                  <div className="grid grid-cols-3 gap-1 bg-bg p-0.5 rounded-lg border border-border-accent/30 text-[9px] font-mono text-center">
                    {[
                      { id: 'wifi', label: 'Wi-Fi' },
                      { id: '5g', label: '5G LTE' },
                      { id: 'offline', label: 'Offline' },
                    ].map((net) => (
                      <button
                        key={net.id}
                        onClick={() => {
                          setNetworkStatus(net.id as any);
                          if (net.id === 'offline') {
                            setIsOffline(true);
                          } else {
                            setIsOffline(false);
                          }
                        }}
                        className={`py-1 rounded font-bold transition-all ${
                          networkStatus === net.id
                            ? 'bg-accent/20 text-accent border border-accent/20'
                            : 'text-muted hover:text-text-main'
                        }`}
                      >
                        {net.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lock Screen simulation */}
                <div className="pt-2 border-t border-border-accent/15 flex justify-between items-center">
                  <span className="text-[10px] text-muted font-mono">Lock Device Screen</span>
                  <Button
                    onClick={() => setIsScreenLocked(!isScreenLocked)}
                    variant="ghost"
                    className="h-6 px-2.5 text-[10px] font-mono bg-bg/50 border border-border-accent/30 rounded-lg hover:bg-bg"
                  >
                    {isScreenLocked ? 'Unlock Screen' : 'Press Sleep Button'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Native API Simulator */}
            <div className="bg-card/20 border border-border-accent/20 rounded-xl p-3 space-y-2">
              <h3 className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-muted">
                Capacitor API Triggers
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  onClick={() => {
                    if (window.navigator.vibrate) {
                      window.navigator.vibrate([100]);
                    }
                    toast.success(`Haptic Vibration simulated!`);
                  }}
                  variant="ghost"
                  className="h-7 text-[9px] font-mono bg-bg/50 hover:bg-bg border border-border-accent/30 rounded-lg justify-center"
                >
                  Trigger Haptic
                </Button>
                <Button
                  onClick={() => {
                    toast.success(`Active Share sheet deployed!`);
                  }}
                  variant="ghost"
                  className="h-7 text-[9px] font-mono bg-bg/50 hover:bg-bg border border-border-accent/30 rounded-lg justify-center"
                >
                  Trigger Share
                </Button>
              </div>
            </div>

            {/* Terminal Command Copier */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block">Terminal CLI Scripts</label>
                <Terminal className="h-3 w-3 text-muted" />
              </div>
              <div className="space-y-1.5 bg-card/60 p-2.5 rounded-xl border border-border-accent/30">
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

          {/* Device Outer Frame with physical buttons */}
          <div 
            className={`relative my-4 mx-auto bg-slate-950 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 border-[10px] ${
              deviceColor === 'titanium' ? 'border-slate-500 ring-4 ring-slate-400/20' :
              deviceColor === 'obsidian' ? 'border-slate-800 ring-4 ring-slate-900/20' :
              deviceColor === 'gold' ? 'border-amber-600 ring-4 ring-amber-500/20' :
              'border-teal-800 ring-4 ring-teal-700/20'
            } ${
              deviceType === 'iphone' ? 'rounded-[50px]' :
              deviceType === 'galaxy' ? 'rounded-[24px]' :
              'rounded-[38px]'
            } ${
              isLandscape ? 'w-[690px] h-[340px]' : 'w-[340px] h-[690px]'
            }`}
          >
            {/* Physical Button Simulations Outside Frame */}
            {deviceType === 'iphone' ? (
              <>
                {/* Action button */}
                <button 
                  onClick={() => {
                    toggleTheme();
                    toast.success("Action Button pressed: Switched application theme!");
                  }}
                  className="absolute left-[-13px] top-[60px] w-1 h-5 bg-inherit border-l-2 border-inherit rounded-l-md hover:brightness-125 cursor-pointer z-50 transition-all active:scale-95" 
                  title="iOS Action Button"
                />
                {/* Vol up */}
                <button 
                  onClick={() => {
                    setVolumeLevel(prev => Math.min(prev + 10, 100));
                    setShowVolumeUI(true);
                  }}
                  className="absolute left-[-13px] top-[95px] w-1 h-8 bg-inherit border-l-2 border-inherit rounded-l-md hover:brightness-125 cursor-pointer z-50 transition-all active:scale-95"
                  title="Volume Up"
                />
                {/* Vol down */}
                <button 
                  onClick={() => {
                    setVolumeLevel(prev => Math.max(prev - 10, 0));
                    setShowVolumeUI(true);
                  }}
                  className="absolute left-[-13px] top-[135px] w-1 h-8 bg-inherit border-l-2 border-inherit rounded-l-md hover:brightness-125 cursor-pointer z-50 transition-all active:scale-95"
                  title="Volume Down"
                />
                {/* Power button */}
                <button 
                  onClick={() => setIsScreenLocked(!isScreenLocked)}
                  className="absolute right-[-13px] top-[110px] w-1 h-12 bg-inherit border-r-2 border-inherit rounded-r-md hover:brightness-125 cursor-pointer z-50 transition-all active:scale-95"
                  title="Power (Sleep)"
                />
              </>
            ) : (
              <>
                {/* Android Volume Key */}
                <button 
                  onClick={() => {
                    setVolumeLevel(prev => Math.min(prev + 10, 100));
                    setShowVolumeUI(true);
                  }}
                  className="absolute right-[-13px] top-[75px] w-1 h-14 bg-inherit border-r-2 border-inherit rounded-r-md hover:brightness-125 cursor-pointer z-50 transition-all active:scale-95"
                  title="Volume Key"
                />
                {/* Android Power Key */}
                <button 
                  onClick={() => setIsScreenLocked(!isScreenLocked)}
                  className="absolute right-[-13px] top-[145px] w-1 h-8 bg-inherit border-r-2 border-inherit rounded-r-md hover:brightness-125 cursor-pointer z-50 transition-all active:scale-95"
                  title="Power Key"
                />
              </>
            )}

            {/* Screen Glass Reflections overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 to-white/5 pointer-events-none z-45 select-none" />

            {/* Simulated Lock Screen Layer */}
            {isScreenLocked && (
              <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                <Lock className="h-10 w-10 text-accent animate-pulse mb-3" />
                <span className="text-xl font-mono font-bold tracking-tight text-white">{currentTimeStr}</span>
                <span className="text-[10px] font-mono text-muted tracking-wider uppercase mt-1">DEVICE LOCKED</span>
                <button 
                  onClick={() => setIsScreenLocked(false)}
                  className="mt-6 px-4 py-2 bg-accent hover:bg-bright text-white text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Unlock Device
                </button>
              </div>
            )}

            {/* Screen Notch / Camera Island cutout */}
            {deviceType === 'iphone' ? (
              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center border border-slate-800/40 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700/50 mr-1.5 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/40" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80 mr-4" />
                <div className="text-[7px] font-mono font-semibold text-accent/80 animate-pulse">Pulsr</div>
              </div>
            ) : (
              <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-slate-950 rounded-full z-50 border border-slate-800/60 shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950/50" />
              </div>
            )}

            {/* On-Screen Volume Slider Overlay */}
            {showVolumeUI && (
              <div className="absolute left-3 top-20 z-50 bg-slate-900/90 backdrop-blur-md rounded-xl p-2 w-7 h-28 flex flex-col items-center justify-between border border-border-accent/30 animate-fade-in select-none">
                <span className="text-[8px] font-mono font-bold text-muted">
                  {volumeLevel === 0 ? <VolumeX className="h-3 w-3 text-error" /> : <Volume2 className="h-3 w-3 text-accent" />}
                </span>
                <div className="flex-1 w-1 bg-slate-800 rounded-full relative overflow-hidden my-2">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-accent transition-all duration-100 rounded-full" 
                    style={{ height: `${volumeLevel}%` }} 
                  />
                </div>
                <span className="text-[8px] font-mono font-bold text-white">{volumeLevel}%</span>
              </div>
            )}

            {/* Simulated Native Status Bar */}
            <div className="h-8 bg-surface px-5 pt-1.5 flex justify-between items-center text-[10px] font-sans font-extrabold select-none z-40 shrink-0 border-b border-border-accent/5">
              <span className="font-mono">{currentTimeStr || '09:41'}</span>
              <div className="flex items-center gap-1.5">
                {/* Network connectivity symbol */}
                {networkStatus === 'offline' || isOffline ? (
                  <WifiOff className="h-3 w-3 text-error animate-pulse" />
                ) : networkStatus === 'wifi' ? (
                  <Wifi className="h-3 w-3 text-accent" />
                ) : (
                  <div className="flex items-center gap-0.5">
                    <Wifi className="h-3 w-3 text-text-main" />
                    <span className="text-[7px] font-mono font-extrabold text-accent">5G</span>
                  </div>
                )}
                
                {/* Battery display */}
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-mono font-bold text-muted">{batteryLevel}%</span>
                  <div className="w-4.5 h-2.5 border border-text-main/50 rounded-sm p-[1px] flex items-center relative">
                    <div 
                      className={`h-full rounded-2xs ${batteryLevel < 20 ? 'bg-error' : 'bg-accent'}`} 
                      style={{ width: `${batteryLevel}%` }} 
                    />
                    {isCharging && (
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] text-yellow-400 font-extrabold font-mono">⚡</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inner App Frame */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-bg text-text-main select-none">
              {/* Header inside device */}
              <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Main view content with screen transitions */}
              <div className="flex-1 p-2 pb-24 relative overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Floating mobile nav inside device */}
              <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} isSimulator={true} />
            </div>

            {/* Swipe indicator bar (iOS Only) */}
            {simulatedPlatform === 'ios' && !isLandscape && (
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
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* 4. Mobile Bottom Nav controls */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 5. Custom PWA Install Floating Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-md bg-surface/90 backdrop-blur-md border border-accent/30 p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,212,170,0.15)] flex items-center justify-between gap-4 z-50 animate-fade-in select-none">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2.5 rounded-xl border border-accent/20">
              <Smartphone className="h-5 w-5 text-accent animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-bright uppercase tracking-wider">Install Pulsr Mobile</h4>
              <p className="text-[10px] text-muted leading-tight mt-0.5">Add to home screen for lightning-fast, offline-capable AI content tools.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstallApp}
              className="bg-accent hover:bg-accent/80 text-white text-[10px] font-mono font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
            >
              <Download className="h-3 w-3" /> Install
            </button>
            <button 
              onClick={() => {
                setShowInstallBanner(false);
                sessionStorage.setItem('pulsr-install-dismissed', 'true');
              }}
              className="text-muted hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. iOS Manual PWA Install Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border-accent/30 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
            <div className="bg-accent/10 w-12 h-12 rounded-2xl flex items-center justify-center border border-accent/20">
              <Apple className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-bright">iOS Safari Install Guide</h4>
              <p className="text-xs text-muted">To install Pulsr onto your iPhone or iPad, please complete these steps manually in Safari:</p>
            </div>
            <div className="bg-bg/40 border border-border-accent/10 p-3 rounded-xl font-mono text-[10px] text-left space-y-2 text-text-main w-full">
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">1.</span>
                <span>Tap the <span className="text-bright font-bold">Share</span> button at the bottom navigation bar.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">2.</span>
                <span>Scroll down the share list and select <span className="text-bright font-bold">"Add to Home Screen"</span>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">3.</span>
                <span>Tap <span className="text-bright font-bold">"Add"</span> in the top-right corner.</span>
              </div>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-border-accent/20 hover:bg-border-accent/30 text-text-main hover:text-white rounded-xl text-xs font-mono transition-all font-bold"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Global Alerts layer */}
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}
