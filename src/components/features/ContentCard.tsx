import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Bookmark, BookmarkCheck, RefreshCw, ChevronDown, ChevronUp, Clock, Lightbulb, Share2 } from 'lucide-react';
import { ContentSuggestion } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

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

  return (
    <Card
      onClick={() => onEdit(suggestion)}
      className="cursor-pointer group select-none relative overflow-hidden"
    >
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
