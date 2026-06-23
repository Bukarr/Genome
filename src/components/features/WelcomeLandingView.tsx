import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Globe 
} from 'lucide-react';
import { Button } from '../ui/Button';

interface WelcomeLandingViewProps {
  hasProfile: boolean;
  onEnterWorkspace: () => void;
  onStartOnboarding: () => void;
}

export function WelcomeLandingView({ 
  hasProfile, 
  onEnterWorkspace, 
  onStartOnboarding 
}: WelcomeLandingViewProps) {
  const [hideNextTime, setHideNextTime] = useState(false);

  const handleProceed = (onboarding: boolean) => {
    if (hideNextTime) {
      localStorage.setItem('genome-hide-landing', 'true');
    }
    if (onboarding) {
      onStartOnboarding();
    } else {
      onEnterWorkspace();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main select-none flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient security decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-bright/5 blur-[120px] pointer-events-none" />

      {/* Main Body */}
      <div className="max-w-4xl w-full mx-auto px-6 py-12 md:py-20 z-10 space-y-16">
        
        {/* Header / Brand info */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono font-bold uppercase tracking-wider animate-pulse"
          >
            <Shield className="h-3.5 w-3.5" /> SECURE AI ENGINE ONLINE
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-syne font-extrabold text-4xl sm:text-6xl text-bright tracking-tight"
          >
            Genome<span className="text-text-main">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed"
          >
            The production-grade Social Media Content Strategy Workspace. Engineered to securely draft, schedule, analyze, and optimize your creator presence with absolute data safety.
          </motion.p>
        </div>

        {/* Action center cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-surface/50 border border-border-accent/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md max-w-2xl mx-auto text-center"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-syne text-bright">Enter the Workspace</h2>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Genome AI syncs custom content models directly to your browser key-chains. No third-party servers ever leak your details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {hasProfile ? (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => handleProceed(false)}
                className="w-full sm:w-auto px-8 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Go to Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => handleProceed(true)}
                className="w-full sm:w-auto px-8 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Start Onboarding Setup <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {hasProfile && (
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => handleProceed(true)}
                className="w-full sm:w-auto text-xs text-muted hover:text-text-main"
              >
                Configure New Profile
              </Button>
            )}
          </div>

          {/* Skip-next-time preference indicator */}
          <div className="pt-2 border-t border-border-accent/15 flex items-center justify-center gap-2">
            <input 
              type="checkbox" 
              id="hideLandingCheck" 
              checked={hideNextTime}
              onChange={(e) => setHideNextTime(e.target.checked)}
              className="rounded border-border-accent/50 bg-bg text-accent focus:ring-accent w-4 h-4 cursor-pointer"
            />
            <label htmlFor="hideLandingCheck" className="text-[11px] text-muted font-medium cursor-pointer flex items-center gap-1 select-none">
              Skip this welcome details screen on subsequent loads
            </label>
          </div>
        </motion.div>

        {/* Feature Grid Details */}
        <div className="space-y-8">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-accent text-center">
            CORE PLATFORM CAPABILITIES
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface/30 border border-border-accent/30 rounded-2xl p-5 space-y-3 transition-colors hover:border-accent/30"
            >
              <div className="p-2 w-fit rounded-lg bg-accent/10 border border-accent/25 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-syne font-bold text-text-main text-base">Predictive Suggestion Engine</h3>
              <p className="text-xs text-muted leading-relaxed">
                Unlock daily highly specific, customizable posts utilizing a resilient cascading model matrix covering Twitter/X, LinkedIn, Facebook, and Instagram.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface/30 border border-border-accent/30 rounded-2xl p-5 space-y-3 transition-colors hover:border-accent/30"
            >
              <div className="p-2 w-fit rounded-lg bg-indigo-400/10 border border-indigo-400/25 text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-syne font-bold text-text-main text-base">Trend Intelligence Analyzer</h3>
              <p className="text-xs text-muted leading-relaxed">
                Scan high-signal industry developments directly from the server. Instantly spin any trend insight into custom crafted drafts aligned to your profile.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface/30 border border-border-accent/30 rounded-2xl p-5 space-y-3 transition-colors hover:border-accent/30"
            >
              <div className="p-2 w-fit rounded-lg bg-emerald-400/10 border border-emerald-400/25 text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-syne font-bold text-text-main text-base">Visual Planning Calendar</h3>
              <p className="text-xs text-muted leading-relaxed">
                Map custom schedule templates across platforms. Drag, schedule, drop, refine, and plan posts dynamically to maintain perfect visual publishing order.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface/30 border border-border-accent/30 rounded-2xl p-5 space-y-3 transition-colors hover:border-accent/30"
            >
              <div className="p-2 w-fit rounded-lg bg-purple-400/10 border border-purple-400/25 text-purple-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-syne font-bold text-text-main text-base">Adaptive Content Strategist</h3>
              <p className="text-xs text-muted leading-relaxed">
                Directly chat with Genome AI content strategist trained in your exclusive persona. Recalibrates instantly to feedback, draft scripts, or outline threads.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface/30 border border-border-accent/30 rounded-2xl p-5 space-y-3 transition-colors hover:border-accent/30"
            >
              <div className="p-2 w-fit rounded-lg bg-rose-400/10 border border-rose-400/25 text-rose-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-syne font-bold text-text-main text-base">Action Activity Tracking Logs</h3>
              <p className="text-xs text-muted leading-relaxed">
                Interactive logs register all system events automatically. Download records to local JSON files instantly in settings or wipe details when needed.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface/30 border border-border-accent/30 rounded-2xl p-5 space-y-3 transition-colors hover:border-accent/30"
            >
              <div className="p-2 w-fit rounded-lg bg-teal-400/10 border border-teal-400/25 text-teal-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-syne font-bold text-text-main text-base">Strict Active Security</h3>
              <p className="text-xs text-muted leading-relaxed">
                Multi-layer security architecture with rate-limiting, express input sanitizations, defensive API key proxies, and full zero-knowledge local persistence.
              </p>
            </motion.div>

          </div>
        </div>

        {/* Security Details block specifically requested */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-surface/20 border border-border-accent/20 rounded-2xl p-6 space-y-4 max-w-xl mx-auto"
        >
          <div className="flex gap-2 items-center text-accent select-none">
            <Lock className="h-4.5 w-4.5" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Enterprise Security Safeguards</h3>
          </div>
          <ul className="text-xs text-muted space-y-2.5 leading-relaxed list-none pl-0">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              <span><strong>Server-Side API Encryption</strong>: The system hides all generative tokens in server environments, blocking key exposure from browser inspectors.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              <span><strong>Active IP Rate Limiters</strong>: Built-in request-limit thresholds guard models on the backbone network from abuse.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              <span><strong>Total Data Isolation</strong>: We enforce local storage keys for persistence, giving you absolute ownership over deletion and wiping cycles.</span>
            </li>
          </ul>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-border-accent/15 z-10 select-none bg-surface/10">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
          GENOME AI v1.2.0 • BUILT WITH DEEP SECURITY PROTOCOLS • SSL VERIFIED
        </span>
      </footer>
    </div>
  );
}
export default WelcomeLandingView;
