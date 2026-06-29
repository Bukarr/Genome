import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Bookmark, BookmarkCheck, RefreshCw, ChevronDown, ChevronUp, Clock, Lightbulb, Share2, Briefcase, Scissors, Smile, Flame } from 'lucide-react';
import { ContentSuggestion } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useContentStore } from '../../store/contentStore';
import { pulsrFetch } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ContentCardProps {
  suggestion: ContentSuggestion;
  onEdit: (suggestion: ContentSuggestion) => void;
  onRegenerate?: (suggestion: ContentSuggestion) => void;
  onSave?: (suggestion: ContentSuggestion) => void;
  onPublish?: (suggestion: ContentSuggestion) => void;
  isSaved?: boolean;
}

export function ContentCard({
  suggestion,
  onEdit,
  onRegenerate,
  onSave,
  onPublish,
  isSaved = false,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { updateSuggestion } = useContentStore();
  const [refining, setRefining] = useState<string | null>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fullPost = `${suggestion.engagementHook}\n\n${suggestion.content}\n\n${suggestion.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`;
      await navigator.clipboard.writeText(fullPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(suggestion);
    }
  };

  const handleRegen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRegenerate) {
      onRegenerate(suggestion);
    }
  };

  const handleQuickAction = async (e: React.MouseEvent, actionLabel: string, instruction: string) => {
    e.stopPropagation();
    if (refining) return;
    
    setRefining(actionLabel);
    const toastId = toast.loading(`Refining post: ${actionLabel}...`);
    try {
      const storedProfile = localStorage.getItem('pulsr-profile');
      let profileObj = {};
      if (storedProfile) {
        try {
          profileObj = JSON.parse(storedProfile)?.state?.profile || {};
        } catch (err) {
          console.error('Failed to parse profile in ContentCard:', err);
        }
      }

      const response = await pulsrFetch('/api/gemini/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profileObj,
          text: `${suggestion.engagementHook}\n\n${suggestion.content}`,
          instruction,
        }),
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails?.error || 'Failed to refine post');
      }

      const result = await response.json();
      if (result && result.content) {
        const lines = result.content.split('\n\n');
        let newHook = suggestion.engagementHook;
        let newContent = result.content;
        
        if (lines.length > 1) {
          newHook = lines[0].trim();
          newContent = lines.slice(1).join('\n\n').trim();
        } else {
          newContent = result.content.trim();
        }

        updateSuggestion(suggestion.id, {
          content: newContent,
          engagementHook: newHook,
        });
        toast.success(`Polished post to sound more ${actionLabel.toLowerCase()}!`, { id: toastId });
      } else {
        throw new Error('Refined content structure was empty.');
      }
    } catch (err: any) {
      console.error('ContentCard quick action error:', err);
      toast.error(err.message || 'Failed to refine post. Please try again.', { id: toastId });
    } finally {
      setRefining(null);
    }
  };

  return (
    <Card
      onClick={() => onEdit(suggestion)}
      className="cursor-pointer group select-none relative overflow-hidden min-h-[160px]"
    >
      {/* Absolute Loading overlay during refinement */}
      {refining && (
        <div className="absolute inset-0 bg-bg/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10 rounded-xl">
          <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-muted">Refining to {refining}...</span>
        </div>
      )}

      {/* Top action row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-1.5 max-w-[65%]">
          <Badge variant="accent">{suggestion.platform}</Badge>
          <Badge variant="default">{suggestion.format}</Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy to Clipboard"
            className="h-9 w-9 p-1 hover:bg-surface text-muted hover:text-bright"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
          </Button>

          {/* Save Button */}
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              title={isSaved ? 'Saved to collection' : 'Save draft'}
              className="h-9 w-9 p-1 hover:bg-surface text-muted hover:text-bright"
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-accent" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Regenerate Button */}
          {onRegenerate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRegen}
              title="Regenerate theme post"
              className="h-9 w-9 p-1 hover:bg-surface text-muted hover:text-bright"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Share/Publish Button */}
          {onPublish && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPublish(suggestion);
              }}
              title="Publish & Export Draft"
              className="h-9 w-9 p-1 hover:bg-surface text-accent hover:text-bright"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Narrative Card contents */}
      <div className="space-y-3">
        {/* Scroll stopper hook line */}
        <h4 className="font-syne font-bold text-text-main text-base md:text-md leading-tight group-hover:text-bright transition-colors select-text">
          {suggestion.engagementHook}
        </h4>

        {/* Narrative body */}
        <p className="text-sm text-text-main/80 leading-relaxed font-sans whitespace-pre-wrap select-text">
          {suggestion.content}
        </p>

        {/* Tags row */}
        {suggestion.hashtags && suggestion.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 font-mono text-xs text-accent">
            {suggestion.hashtags.map((tag, idx) => (
              <span key={idx} className="hover:text-bright transition-colors select-text">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Row */}
      <div className="border-t border-border-accent/30 mt-4 pt-3 space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
          ⚡ One-Click Refinement
        </span>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleQuickAction(e, 'Professional', 'Rewrite this post to sound highly professional, authoritative, educational, structured, and polished.')}
            disabled={!!refining}
            className="text-[10px] h-7 px-2.5 font-mono flex gap-1 bg-bg border border-border-accent/15 hover:border-accent/40 text-muted hover:text-bright select-none active:scale-95"
          >
            <Briefcase className="h-3 w-3 text-accent" /> Make Professional
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleQuickAction(e, 'Shorten', 'Shorten this post significantly. Make it highly concise, punchy, and brief without losing the core takeaways.')}
            disabled={!!refining}
            className="text-[10px] h-7 px-2.5 font-mono flex gap-1 bg-bg border border-border-accent/15 hover:border-accent/40 text-muted hover:text-bright select-none active:scale-95"
          >
            <Scissors className="h-3 w-3 text-accent" /> Shorten
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleQuickAction(e, 'Emojis', 'Infuse relevant and tasteful emojis throughout the post to make it visually engaging and readable, but not overly cluttered.')}
            disabled={!!refining}
            className="text-[10px] h-7 px-2.5 font-mono flex gap-1 bg-bg border border-border-accent/15 hover:border-accent/40 text-muted hover:text-bright select-none active:scale-95"
          >
            <Smile className="h-3 w-3 text-accent" /> Add Emojis
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleQuickAction(e, 'Punchy', 'Rewrite this to be extremely punchy, with strong hooks, direct language, high energy, and maximum engagement potential.')}
            disabled={!!refining}
            className="text-[10px] h-7 px-2.5 font-mono flex gap-1 bg-bg border border-border-accent/15 hover:border-accent/40 text-muted hover:text-bright select-none active:scale-95"
          >
            <Flame className="h-3 w-3 text-accent" /> Make Punchier
          </Button>
        </div>
      </div>

      {/* Expandable Tips slider */}
      <div className="border-t border-border-accent/40 mt-4 pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="flex items-center justify-between w-full text-xs font-mono text-muted hover:text-text-main transition-colors outline-none"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
            <Lightbulb className="h-3.5 w-3.5 text-accent" /> AI Insights & Best Time
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2.5 mt-3 text-xs bg-bg/50 p-3 rounded-xl border border-border-accent/30 list-none">
                {suggestion.bestTimeToPost && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    <span>
                      <strong className="text-text-main">Best Time:</strong>{' '}
                      <span className="font-mono text-bright">{suggestion.bestTimeToPost}</span>
                    </span>
                  </div>
                )}
                {suggestion.tip && (
                  <div className="flex items-start gap-2 leading-relaxed">
                    <div className="mt-0.5">💡</div>
                    <span>
                      <strong className="text-text-main">Strategy:</strong>{' '}
                      <span className="text-text-main/70">{suggestion.tip}</span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
