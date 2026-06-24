import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Check } from 'lucide-react';
import { ContentSuggestion } from '../../types';
import { getCharacterLimit, getPlatformColor, pulsrFetch } from '../../lib/utils';
import { Textarea, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

interface ContentEditorProps {
  suggestion: ContentSuggestion;
  onSave: (id: string, updatedContent: string, updatedHook?: string) => void;
  onClose: () => void;
}

export function ContentEditor({ suggestion, onSave, onClose }: ContentEditorProps) {
  const [contentBody, setContentBody] = useState('');
  const [hook, setHook] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [improving, setImproving] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load initial content on open
  useEffect(() => {
    if (suggestion) {
      setContentBody(suggestion.content || '');
      setHook(suggestion.engagementHook || '');
    }
  }, [suggestion]);

  const characterLimit = getCharacterLimit(suggestion.platform);
  const currentLength = contentBody.length + (hook ? hook.length + 2 : 0); // content + hook length
  const isOverLimit = currentLength > characterLimit;

  // Refine post using Gemini's /api/gemini/refine endpoint
  const handleImproveWithAI = async () => {
    if (!contentBody.trim()) {
      toast.error('Post content cannot be empty.');
      return;
    }

    setImproving(true);
    const toastId = toast.loading('Pulsr is polishing your draft...');

    try {
      const storedProfile = localStorage.getItem('pulsr-profile');
      let profileObj = {};
      if (storedProfile) {
        try {
          profileObj = JSON.parse(storedProfile)?.state?.profile || {};
        } catch (e) {
          console.error('Failed to parse pulsr-profile state:', e);
        }
      }

      const response = await pulsrFetch('/api/gemini/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profileObj,
          text: `${hook}\n\n${contentBody}`,
          instruction: refinePrompt || 'Make it punchier, improve hooks, and preserve my natural author voice.',
        }),
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails?.error || 'Failed to refine post');
      }

      const result = await response.json();
      if (result && result.content) {
        // Look for split of hook and main content body
        const lines = result.content.split('\n\n');
        if (lines.length > 1) {
          setHook(lines[0].trim());
          setContentBody(lines.slice(1).join('\n\n').trim());
        } else {
          setContentBody(result.content.trim());
        }
        setRefinePrompt(''); // Clear instructions bar
        toast.success('Draft polished successfully by AI!', { id: toastId });
      } else {
        throw new Error('Invalid output format from Pulsr');
      }
    } catch (error: any) {
      console.error('Improve With AI Error:', error);
      toast.error(error?.message || 'Failed to polish post. Try again.', { id: toastId });
    } finally {
      setImproving(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      onSave(suggestion.id, contentBody, hook);
      toast.success('Draft changes saved successfully.');
      onClose();
    } catch (err) {
      toast.error('Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Platform & Badge heading */}
      <div className="flex items-center gap-2">
        <Badge variant="accent">{suggestion.platform}</Badge>
        <Badge variant="default">{suggestion.format}</Badge>
      </div>

      <div className="space-y-4">
        {/* Scroll Stopper Hook Field */}
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
            Engagement Hook Line
          </label>
          <Input
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="A punchy first sentence or question..."
          />
        </div>

        {/* Core Post Contents */}
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
            Post Body content
          </label>
          <Textarea
            value={contentBody}
            onChange={(e) => setContentBody(e.target.value)}
            rows={7}
            placeholder="What do you want to write..."
            className="min-h-[160px] font-sans"
          />
        </div>

        {/* Character Count indicators */}
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-muted">
            Platform:{' '}
            <strong className="text-text-main font-semibold capitalize">
              {suggestion.platform}
            </strong>
          </span>
          <span className={isOverLimit ? 'text-error font-bold animate-pulse' : 'text-muted'}>
            Characters: {currentLength}
            {characterLimit < 99999 && ` / ${characterLimit}`}
          </span>
        </div>

        {isOverLimit && (
          <p className="text-xs text-error font-mono bg-error/10 border border-error/25 p-2 rounded-lg leading-relaxed">
            ⚠️ Warning: Your draft length ({currentLength}) exceeds the standard character limit for{' '}
            {suggestion.platform} of {characterLimit} characters.
          </p>
        )}
      </div>

      {/* Polish Section */}
      <div className="border-t border-border-accent/35 pt-4 space-y-2.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-accent block">
          Improve with Pulsr AI
        </label>
        <div className="flex gap-2">
          <Input
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            placeholder="e.g. 'make it shorter', 'add bullet points', 'sound more witty'..."
            className="flex-1"
            disabled={improving}
          />
          <Button
            variant="accent"
            size="md"
            onClick={handleImproveWithAI}
            loading={improving}
            disabled={improving}
            className="whitespace-nowrap flex gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Polish
          </Button>
        </div>
      </div>

      {/* Footer operations */}
      <div className="flex justify-end gap-2 border-t border-border-accent/35 pt-4">
        <Button variant="ghost" onClick={onClose} disabled={saving || improving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveDraft}
          loading={saving}
          disabled={saving || improving}
          className="flex gap-1.5 font-bold"
        >
          <Save className="h-4 w-4" /> Save Post
        </Button>
      </div>
    </div>
  );
}
