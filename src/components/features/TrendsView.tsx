import React, { useEffect, useState } from 'react';
import { RefreshCw, Zap, Flame, AlertTriangle, Cpu, TrendingUp, Clock } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { TrendItem } from '../../types';
import { TrendCard } from './TrendCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TrendCardSkeleton } from '../ui/Skeleton';
import { pulsrFetch } from '../../lib/utils';
import toast from 'react-hot-toast';

interface TrendsViewProps {
  onNavigateToSuggest: (topic: string, platform?: string) => void;
}

export function TrendsView({ onNavigateToSuggest }: TrendsViewProps) {
  const { profile } = useProfileStore();
  const { trackEvent } = useAnalyticsStore();

  const [activePlatform, setActivePlatform] = useState(profile?.primaryPlatform || 'LinkedIn');
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Fetch trends from our Grounded /api/gemini/trends endpoint
  const getGroundedTrends = async (forceRefresh = false) => {
    if (!profile) return;
    try {
      setLoading(true);
      setErrorText('');
      
      const response = await pulsrFetch('/api/gemini/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, platform: activePlatform }),
      });

      if (!response.ok) {
        throw new Error('Overlapping timeout or network is currently choked. Tap retry to reload.');
      }

      const rawData = await response.json();

      if (Array.isArray(rawData)) {
        setTrends(rawData);
        setLastUpdated(new Date().toLocaleTimeString());
        trackEvent('trend_view', `Refreshed real-time trending topics for niche: "${profile.niche}"`, { topicsCount: rawData.length });
        if (forceRefresh) {
          toast.success('Grounded trends updated with live web data.');
        }
      } else {
        throw new Error('Could not parse grounded data. Try refreshing the trends.');
      }
    } catch (err: any) {
      console.error('Trends retrieve failed:', err);
      setErrorText(err?.message || 'Failed to sync niche trends.');
      
      // Fallback fallback defaults if network or APIs reject
      if (trends.length === 0) {
        const fallbacks: TrendItem[] = [
          {
            topic: `${profile.niche} Growth Tech`,
            summary: `Recent shifts show a sharp focus on micro-learning content on ${profile.primaryPlatform}.`,
            momentum: 'hot',
            relevanceReason: `Connects directly to your niche of ${profile.niche} to educate juniors.`,
            contentAngle: `Share a quick 3-bullet breakdown showing a high-performing lesson workflow.`,
          },
          {
            topic: `AI Productivity in ${profile.profession}`,
            summary: `Professionals are searching for realistic ways to streamline daily routines.`,
            momentum: 'rising',
            relevanceReason: `Aligns with your authority goals and preferred formats.`,
            contentAngle: `Write an inspirational thought starter about shifting from busywork to strategy.`,
          },
        ];
        setTrends(fallbacks);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroundedTrends();
  }, [profile, activePlatform]);

  // Divide into sections
  const hotTrends = trends.filter((t) => t.momentum === 'hot');
  const risingTrends = trends.filter((t) => t.momentum === 'rising' || !t.momentum);

  return (
    <div className="space-y-6 select-none pb-20 md:pb-8">
      {/* 1. Header controls list */}
      <h2 className="hidden" id="trendsHeading">Industry Trends Analysis</h2>
      <div className="flex justify-between items-center bg-bg/25 border border-border-accent/40 rounded-2xl p-4 shadow-sm select-none">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent/15 text-accent animate-pulse">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="leading-snug">
            <span className="text-[10px] whitespace-nowrap uppercase font-mono tracking-widest text-[#22C55E] block font-extrabold leading-none mb-1">
              Google Search Grounded
            </span>
            <p className="text-xs text-muted font-mono inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last Synced:{' '}
              <span className="text-text-main font-semibold">{lastUpdated || 'Initial sync'}</span>
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => getGroundedTrends(true)}
          disabled={loading}
          className="h-9 py-1 px-3 bg-surface hover:bg-card text-xs font-mono select-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin text-accent' : ''}`} />{' '}
          Sync Trends
        </Button>
      </div>

      {/* Platform Selector Tabs */}
      <div className="space-y-1.5 flex flex-col select-none">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted px-1">Select Live Trends Channel</label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['LinkedIn', 'Facebook', 'Twitter/X'].map((plat) => (
            <button
              key={plat}
              type="button"
              onClick={() => setActivePlatform(plat)}
              className={`text-xs px-4 py-2.5 rounded-xl border font-mono transition-all font-bold whitespace-nowrap active:scale-95 cursor-pointer ${
                activePlatform === plat
                  ? 'bg-accent/15 border-accent text-accent shadow-[0_0_15px_rgba(0,212,170,0.1)]'
                  : 'bg-surface/50 border-border-accent/40 text-muted hover:text-text-main'
              }`}
            >
              {plat === 'Twitter/X' ? 'X / Twitter' : plat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Error Message banner */}
      {errorText && (
        <Card className="border-error/20 bg-error/5 p-4 flex gap-3 text-sm flex-col sm:flex-row items-center justify-between">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-error">Syncing Issue</p>
              <p className="text-text-main/70 text-xs mt-0.5 leading-relaxed font-sans">{errorText}</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => getGroundedTrends(true)}>
            Retry Sync
          </Button>
        </Card>
      )}

      {/* 3. Skeleton layout or real elements */}
      {loading ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-surface/50 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrendCardSkeleton />
              <TrendCardSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 select-text">
          {/* Section A: Hot topics */}
          {hotTrends.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-error flex items-center gap-1 select-none">
                <Flame className="h-4 w-4 fill-current" /> Trending Now in {profile?.niche}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotTrends.map((trend, idx) => (
                  <TrendCard 
                    key={idx} 
                    trend={trend} 
                    onCreateContent={(topic) => onNavigateToSuggest(`Trend Topic: "${trend.topic}" (Context: ${trend.summary} - Focus Angle: ${trend.contentAngle})`, activePlatform)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section B: Rising topics */}
          {risingTrends.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-accent flex items-center gap-1 select-none">
                <TrendingUp className="h-4 w-4" /> Emerging Shifts & Rising Subjects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {risingTrends.map((trend, idx) => (
                  <TrendCard 
                    key={idx} 
                    trend={trend} 
                    onCreateContent={(topic) => onNavigateToSuggest(`Trend Topic: "${trend.topic}" (Context: ${trend.summary} - Focus Angle: ${trend.contentAngle})`, activePlatform)} 
                  />
                ))}
              </div>
            </div>
          )}

          {trends.length === 0 && !loading && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border-accent/30 bg-surface/10 select-none">
              <Zap className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-main">No trends found</p>
              <p className="text-xs text-muted font-mono mt-0.5">Wait a moment and sync again</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
