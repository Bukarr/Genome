import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';
import { UserProfile } from '../../types';
import { StepWrapper } from './OnboardingStep';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Chip } from '../ui/Chip';
import toast from 'react-hot-toast';

interface OnboardingViewProps {
  onComplete: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { profile, setProfile, updateProfile } = useProfileStore();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Form states matching UserProfile schema
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [niche, setNiche] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState('Twitter/X');
  const [postingGoals, setPostingGoals] = useState<string[]>([]);
  const [contentVision, setContentVision] = useState('');
  const [tone, setTone] = useState('');
  const [contentFormats, setContentFormats] = useState<string[]>([]);
  const [geolocation, setGeolocation] = useState('');

  // Pre-fill if user has a profile but is re-editing
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setProfession(profile.profession || '');
      setNiche(profile.niche || '');
      setPrimaryPlatform(profile.primaryPlatform || 'Twitter/X');
      setPostingGoals(profile.postingGoals || []);
      setContentVision(profile.contentVision || '');
      setTone(profile.tone || '');
      setContentFormats(profile.contentFormats || []);
      setGeolocation(profile.geolocation || '');
    }
  }, [profile]);

  // Options lists
  const goalOptions = [
    'Grow audience',
    'Build authority',
    'Sell products',
    'Educate',
    'Entertain',
    'Build community',
  ];

  const toneOptions = [
    'Educating',
    'Professional',
    'Casual',
    'Witty',
    'Inspirational',
    'Bold',
    'Storytelling',
  ];

  const formatOptions = [
    'Short posts',
    'Threads',
    'Long-form',
    'Carousels',
    'Video scripts',
    'Quotes',
    'Listicles',
  ];

  const platformOptions = [
    'Twitter/X',
    'LinkedIn',
    'Instagram',
    'Facebook',
    'Threads',
    'TikTok',
    'All platforms',
  ];

  // Multi-select helpers
  const handleToggleGoal = (goal: string) => {
    setPostingGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleToggleFormat = (format: string) => {
    setContentFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  // Safe navigation controls
  const handleNext = () => {
    if (step === 2) {
      if (!name.trim()) return toast.error('Please enter your full name.');
      if (!profession.trim()) return toast.error('Please enter your profession.');
      if (!niche.trim()) return toast.error('Please describe your industry niche.');
      if (postingGoals.length === 0) return toast.error('Please select at least one posting goal.');
    }
    if (step === 3) {
      if (!contentVision.trim() || contentVision.length < 15) {
        return toast.error('Please expand. Be specific with your content vision (min 15 characters).');
      }
    }
    if (step === 4) {
      if (!tone) return toast.error('Please pick your voice tone chip.');
      if (contentFormats.length === 0) return toast.error('Please select at least one preferred format.');
    }

    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Step 5: Personalization timers
  const [loadingText, setLoadingText] = useState('Reading your content vision...');

  useEffect(() => {
    if (step === 5) {
      const messages = [
        'Reading your content vision...',
        'Mapping your niche...',
        'Calibrating your voice...',
        'Preparing your dashboard...',
      ];
      let msgIdx = 0;
      const interval = setInterval(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        setLoadingText(messages[msgIdx]);
      }, 1500);

      // Save complete profile and close onboarding after 3.2s
      const timeout = setTimeout(() => {
        const completeProfile: UserProfile = {
          name,
          profession,
          niche,
          primaryPlatform,
          postingGoals,
          contentVision,
          tone,
          contentFormats,
          geolocation,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
        };
        setProfile(completeProfile);
        clearInterval(interval);
        onComplete();
      }, 3200);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step]);

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <StepWrapper key={1} currentStep={1} totalSteps={5} direction={direction}>
          <div className="text-center space-y-8 select-none">
            {/* Animated slow pulse bg */}
            <div className="space-y-3">
              <h1 className="font-syne font-extrabold text-accent text-4xl md:text-5xl leading-none tracking-tighter">
                Genome<span className="text-text-main">AI</span>
              </h1>
              <p className="text-muted tracking-wider text-xs uppercase font-mono font-bold">
                Your voice. Amplified by AI.
              </p>
            </div>

            {/* Slow radial pulse glow placeholder */}
            <div className="relative h-44 w-full flex items-center justify-center">
              <div className="absolute h-36 w-36 bg-accent/5 rounded-full blur-2xl animate-pulse" />
              <div className="flex items-center justify-center p-6 rounded-3xl bg-surface/30 border border-border-accent/40 z-10">
                <Sparkles className="h-10 w-10 text-accent animate-bounce" />
              </div>
            </div>

            <p className="text-sm text-text-main/78 leading-relaxed max-w-sm mx-auto">
              Draft, schedule, and optimize a highly structured content presence tailored specifically to your exact expertise and audience goals.
            </p>

            <Button variant="primary" size="lg" onClick={handleNext} className="w-full font-bold uppercase tracking-wider text-sm">
              Get Started <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </StepWrapper>
      )}

      {step === 2 && (
        <StepWrapper key={2} currentStep={2} totalSteps={5} direction={direction}>
          <div className="space-y-6">
            <div className="space-y-1.5 select-none">
              <h2 className="font-syne font-extrabold text-2xl text-text-main tracking-tight leading-none">
                Tell us about yourself
              </h2>
              <p className="text-xs text-muted font-mono uppercase">
                Step 2 of 5 — The Foundations
              </p>
            </div>             <div className="space-y-4">
              {/* Full Name field */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Your Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              {/* Profession field */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted col-span-2">Your Job or Profession</label>
                <Input
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Software developer, musician, designer..."
                  required
                />
              </div>

              {/* Industries field */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Your Topic or Industry Niche</label>
                <Input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Clean energy tech, minimalist design, indie SaaS..."
                  required
                />
              </div>

              {/* Geolocation field */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Your Location or City</label>
                <Input
                  value={geolocation}
                  onChange={(e) => setGeolocation(e.target.value)}
                  placeholder="e.g. London, Silicon Valley, Tokyo..."
                />
              </div>

              {/* Selection Field */}
              <div className="space-y-1.5 select-none">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">Primary Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {platformOptions.map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setPrimaryPlatform(plat)}
                      className={`text-xs p-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium active:scale-95 ${
                        primaryPlatform === plat
                          ? 'bg-accent/15 border-accent text-accent'
                          : 'bg-surface border-border-accent/40 text-muted hover:text-text-main'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal pills row */}
              <div className="space-y-1.5 select-none">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">Posting Goals (Select Min 1)</label>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((goal) => {
                    const isActive = postingGoals.includes(goal);
                    return (
                      <Chip key={goal} active={isActive} onClick={() => handleToggleGoal(goal)}>
                        {goal}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step navigation row */}
            <div className="flex justify-between items-center pt-4 select-none">
              <Button variant="ghost" onClick={handleBack} className="flex gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="secondary" onClick={handleNext} className="flex gap-1.5 font-bold">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 3 && (
        <StepWrapper key={3} currentStep={3} totalSteps={5} direction={direction}>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-syne font-extrabold text-2xl text-text-main tracking-tight leading-none">
                What do you want to say to the world?
              </h2>
              <p className="text-xs text-muted font-mono uppercase">
                Step 3 of 5 — Content Vision
              </p>
            </div>

            <div className="space-y-4">
              {/* Textarea description */}
              <p className="text-sm text-text-main/78 leading-relaxed">
                Describe what you want to write about, who you want to reach, and what you want to achieve.
              </p>

              {/* Vision Textbox */}
              <div className="relative">
                <Textarea
                  value={contentVision}
                  onChange={(e) => setContentVision(e.target.value)}
                  rows={9}
                  className="min-h-[200px]"
                  placeholder="e.g. 'I want to share simple coding tips for React and Node. I want to build a warm community of beginners and teach them step-by-step, without using confusing corporate buzzwords...'"
                />
              </div>

              {/* Dynamic counters */}
              <div className="flex justify-between items-center text-xs font-mono text-muted select-none">
                <span>Vision Details Count</span>
                <span>{contentVision.length} Characters</span>
              </div>

              <div className="bg-surface/35 border border-border-accent/40 rounded-xl p-3 select-none">
                <p className="text-[11px] text-muted font-serif italic text-center">
                  "The more specific you are, the smarter your suggestions get."
                </p>
              </div>
            </div>

            {/* Step navigation row */}
            <div className="flex justify-between items-center pt-4 select-none">
              <Button variant="ghost" onClick={handleBack} className="flex gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="secondary" onClick={handleNext} className="flex gap-1.5 font-bold">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 4 && (
        <StepWrapper key={4} currentStep={4} totalSteps={5} direction={direction}>
          <div className="space-y-6">
            <div className="space-y-1.5 select-none">
              <h2 className="font-syne font-extrabold text-2xl text-text-main tracking-tight leading-none">
                Tone & Formats
              </h2>
              <p className="text-xs text-muted font-mono uppercase">
                Step 4 of 5 — Voice & Style
              </p>
            </div>

            <div className="space-y-6">
              {/* Tone Selection Group */}
              <div className="space-y-2 select-none">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">Choose Voice Tone (Select 1)</label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((t) => {
                    const isActive = tone === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`text-xs px-4 py-2 rounded-full border text-center transition-all cursor-pointer font-medium active:scale-95 ${
                          isActive
                            ? 'bg-accent/15 border-accent text-accent shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                            : 'bg-surface border-border-accent/40 text-muted hover:text-text-main'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-2 select-none">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">Preferred Visual Formats (Select Min 1)</label>
                <div className="flex flex-wrap gap-2 flex-grow-0">
                  {formatOptions.map((format) => {
                    const isActive = contentFormats.includes(format);
                    return (
                      <Chip key={format} active={isActive} onClick={() => handleToggleFormat(format)}>
                        {format}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step navigation row */}
            <div className="flex justify-between items-center pt-4 select-none">
              <Button variant="ghost" onClick={handleBack} className="flex gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="primary" onClick={handleNext} className="flex gap-1.5 font-bold">
                Create Profile <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 5 && (
        <StepWrapper key={5} currentStep={5} totalSteps={5} direction={direction}>
          <div className="text-center space-y-8 select-none">
            {/* Pulsing app visual launcher */}
            <div className="relative flex items-center justify-center p-8">
              <div className="absolute h-40 w-40 bg-accent/15 rounded-full blur-2xl animate-ping" />
              <div className="flex items-center justify-center h-28 w-28 rounded-3xl bg-surface/40 border border-accent/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] z-10 animate-pulse">
                <Sparkles className="h-12 w-12 text-accent" />
              </div>
            </div>

            {/* Cycled message text elements */}
            <div className="space-y-3">
              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-mono text-sm uppercase tracking-widest text-accent font-bold"
              >
                {loadingText}
              </motion.p>
              <p className="text-muted text-xs font-mono uppercase">
                Preparing custom dashboard profile
              </p>
            </div>
          </div>
        </StepWrapper>
      )}
    </AnimatePresence>
  );
}
