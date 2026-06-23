import React, { useState } from 'react';
import { Calendar, Plus, Sparkles, AlertCircle, X, CheckCircle } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { CalendarItem } from '../../types';
import { CalendarGrid } from './CalendarGrid';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import toast from 'react-hot-toast';

interface CalendarViewProps {
  onDraftPost: (platform: string, format: string, topic: string) => void;
}

export function CalendarView({ onDraftPost }: CalendarViewProps) {
  const { profile } = useProfileStore();
  const { items, addItem, updateItem, deleteItem } = useCalendarStore();
  const { trackEvent } = useAnalyticsStore();

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignLength, setCampaignLength] = useState('7'); // Default 7 days
  const [buildingCampaign, setBuildingCampaign] = useState(false);

  // Manual scheduling controls
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTopic, setManualTopic] = useState('');
  const [manualHeadline, setManualHeadline] = useState('');
  const [manualPlatform, setManualPlatform] = useState('Twitter/X');
  const [manualFormat, setManualFormat] = useState('Short Post');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualPriority, setManualPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Multi-edit scheduled item modal
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editStatus, setEditStatus] = useState<'planned' | 'draft' | 'posted'>('planned');

  // 1. Campaign Generation logic (calling poster POST /api/gemini/calendar)
  const handleGenerateCampaign = async () => {
    if (!profile) return;
    if (!campaignGoal.trim()) {
      return toast.error('Please describe your campaign goal or topic.');
    }

    setBuildingCampaign(true);
    const toastId = toast.loading('Genome is plotting your multi-day schedule...');

    try {
      const response = await fetch('/api/gemini/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          campaignGoal,
          durationDays: parseInt(campaignLength, 10) || 7,
        }),
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails?.error || 'Multi-day mapping failed');
      }

      const agendaList = await response.json();

      if (Array.isArray(agendaList) && agendaList.length > 0) {
        // Map agenda items with proper generated ids and relative dates
        const agendaItems: CalendarItem[] = agendaList.map((node, index) => {
          // Pad dates starting from tomorrow
          const offset = index + 1;
          const targetDateObj = new Date();
          targetDateObj.setDate(targetDateObj.getDate() + offset);
          const formattedDate = targetDateObj.toISOString().split('T')[0];

          return {
            id: `calendar-ai-${Date.now()}-${idxStr()}-${index}`,
            date: node.date || formattedDate,
            platform: node.platform || profile.primaryPlatform,
            format: node.format || 'Short Post',
            topic: node.topic || campaignGoal,
            headline: node.headline || 'AI Generated content concept',
            priority: (node.priority as any) || 'medium',
            status: 'planned' as const,
          };
        });

        // Add to our Zustand store list
        agendaItems.forEach((item) => addItem(item));
        trackEvent(
          'calendar_interaction',
          `Generated a multi-day (${agendaItems.length} days) marketing campaign about: "${campaignGoal}"`,
          { campaignGoal, durationDays: agendaItems.length }
        );
        
        toast.success(`Successfully mapped ${agendaItems.length}-day marketing campaign!`, { id: toastId });
        setIsCampaignModalOpen(false);
        setCampaignGoal('');
      } else {
        throw new Error('Retrieved campaign data could not be compiled correctly.');
      }
    } catch (err: any) {
      console.error('Calendar Campaign error:', err);
      toast.error(err?.message || 'Failed to map marketing campaign.', { id: toastId });
    } finally {
      setBuildingCampaign(false);
    }
  };

  // Helper code generator
  const idxStr = () => Math.random().toString(36).substr(2, 4);

  // 2. Manual calendar creation
  const handleManualAdd = () => {
    if (!manualTopic.trim() || !manualHeadline.trim()) {
      return toast.error('Please fill in Topic and Concept headline.');
    }

    const newItem: CalendarItem = {
      id: `calendar-manual-${Date.now()}-${idxStr()}`,
      date: manualDate,
      platform: manualPlatform,
      format: manualFormat,
      topic: manualTopic,
      headline: manualHeadline,
      priority: manualPriority,
      status: 'planned',
    };

    addItem(newItem);
    trackEvent(
      'calendar_interaction',
      `Manually scheduled slot for ${newItem.platform} to present "${newItem.topic}"`,
      { platform: newItem.platform, date: newItem.date, format: newItem.format }
    );
    toast.success('Campaign item scheduled on calendar.');
    setIsManualModalOpen(false);
    
    // Clear manual form
    setManualTopic('');
    setManualHeadline('');
  };

  // 3. Edit scheduled items
  const handleOpenEditItem = (item: CalendarItem) => {
    setEditingItem(item);
    setEditTopic(item.topic);
    setEditHeadline(item.headline);
    setEditStatus(item.status);
  };

  const handleSaveEditItem = () => {
    if (!editingItem) return;
    updateItem(editingItem.id, {
      topic: editTopic,
      headline: editHeadline,
      status: editStatus,
    });
    trackEvent(
      'calendar_interaction',
      `Updated schedule item status to "${editStatus}" for topic: "${editTopic}"`,
      { id: editingItem.id, status: editStatus }
    );
    toast.success('Schedule item updated.');
    setEditingItem(null);
  };

  // 4. Removing items
  const handleDeleteItem = (id: string) => {
    deleteItem(id);
    trackEvent('calendar_interaction', `Deleted scheduled calendar item`, { id });
    toast.success('Scheduled post removed.');
  };

  // 5. Generate full draft from schedule trigger
  const handleGeneratePostFromSchedule = (item: CalendarItem) => {
    // Navigates directly to the Suggest tab with values loaded!
    onDraftPost(item.platform, item.format, `${item.topic} - Headline Angle: ${item.headline}`);
    // Update schedule item status to Draft
    updateItem(item.id, { status: 'draft' });
    trackEvent('calendar_interaction', `Initiated AI post drafting from scheduled slot "${item.topic}"`, { id: item.id });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header controls & FAB button */}
      <h2 className="hidden" id="calendarHeading">Social Media Scheduling Calendar</h2>
      <div className="flex justify-between items-center bg-bg/25 border border-border-accent/40 rounded-2xl p-4 shadow-sm select-none">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent/15 text-accent">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="leading-snug">
            <p className="font-syne font-bold text-sm text-text-main leading-none">
              Marketing Campaign Planner
            </p>
            <p className="text-[11px] text-muted font-mono leading-none mt-1 uppercase">
              {items.length} Slots scheduled
            </p>
          </div>
        </div>

        <div className="flex gap-1.5">
          {/* Manual scheduling trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs font-mono h-9 p-2 hover:bg-surface border border-border-accent/30"
          >
            <Plus className="h-4 w-4 mr-1 text-accent" /> Custom Slot
          </Button>

          {/* AI Automated Scheduled Campaign trigger */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCampaignModalOpen(true)}
            className="text-xs h-9 p-2 py-1.5 font-bold flex gap-1 select-none font-mono"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Campaign
          </Button>
        </div>
      </div>

      {/* 2. Main Calendar Content Grid and List */}
      <CalendarGrid
        items={items}
        onEditItem={handleOpenEditItem}
        onDeleteItem={handleDeleteItem}
        onGeneratePost={handleGeneratePostFromSchedule}
        onAddItemClick={() => setIsCampaignModalOpen(true)}
      />

      {/* 3. AI Automation Campaign Dialog Modal */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title="Generate AI Marketing Campaign"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-main/80 leading-relaxed font-sans">
            Describe a product launch, technical campaign topic, or specialized focus. Gemini AI will map out a day-by-day editorial calendar with strategic angles.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Campaign Goal / Core Topic</label>
            <Textarea
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              placeholder="e.g. 'Launching my new React SaaS boiler-plate highlighting security features', or '30 days educating junior designers on CSS grid'..."
              rows={4}
              className="min-h-[100px]"
              disabled={buildingCampaign}
            />
          </div>

          <div className="space-y-1 select-none">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">Campaign Duration & Frequency</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: '7 Days', value: '7' },
                { label: '30 Days', value: '30' },
                { label: '2 Months', value: '60' },
                { label: '6 Months', value: '180' },
                { label: 'All Time', value: '365' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCampaignLength(opt.value)}
                  disabled={buildingCampaign}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-mono text-xs font-semibold ${
                    campaignLength === opt.value
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-surface border-border-accent/40 text-muted hover:text-text-main'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border-accent/35 pt-4">
            <Button variant="ghost" onClick={() => setIsCampaignModalOpen(false)} disabled={buildingCampaign}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateCampaign}
              loading={buildingCampaign}
              disabled={buildingCampaign}
              className="flex gap-1 font-bold"
            >
              <Sparkles className="h-4 w-4 animate-bounce" /> Map Campaign
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Custom Manual Event Dialog Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Schedule Manual Campaign Slot"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted col-span-2">Scheduled Topic</label>
            <Input
              value={manualTopic}
              onChange={(e) => setManualTopic(e.target.value)}
              placeholder="e.g. SQLite database comparisons"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted col-span-2">Concept Angle / Teaser</label>
            <Input
              value={manualHeadline}
              onChange={(e) => setManualHeadline(e.target.value)}
              placeholder="e.g. Why embedded is winning the full-stack landscape today."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted select-none">Platform</label>
              <select
                value={manualPlatform}
                onChange={(e) => setManualPlatform(e.target.value)}
                className="w-full rounded-xl border border-border-accent bg-surface px-3 py-2 text-xs text-text-main focus:outline-none min-h-[40px] uppercase font-mono"
              >
                <option value="Twitter/X">Twitter/X</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Threads">Threads</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted select-none">Date</label>
              <Input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="py-1 px-3 text-xs w-full min-h-[40px] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted select-none">Format</label>
              <Input
                value={manualFormat}
                onChange={(e) => setManualFormat(e.target.value)}
                placeholder="Short Post, Carousel Concept..."
                className="py-1 px-3 text-xs w-full min-h-[40px]"
              />
            </div>

            <div className="space-y-1 select-none">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Priority</label>
              <div className="flex p-0.5 bg-surface rounded-lg border border-border-accent/40 h-[40px]">
                {['low', 'medium', 'high'].map((prio) => (
                  <button
                    key={prio}
                    onClick={() => setManualPriority(prio as any)}
                    className={`flex-1 text-[10px] uppercase font-mono tracking-wider font-bold rounded-md transition-all ${
                      manualPriority === prio ? 'bg-accent/15 text-accent border border-accent/25' : 'text-muted hover:text-text-main'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border-accent/35 pt-4">
            <Button variant="ghost" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleManualAdd} className="font-bold">
              Schedule Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* 5. Edit Existing item Modal */}
      <Modal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Edit Scheduled Item Info"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Scheduled Topic</label>
            <Input
              value={editTopic}
              onChange={(e) => setEditTopic(e.target.value)}
              placeholder="Campaign topic direction"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">Concept Angle Headline</label>
            <Input
              value={editHeadline}
              onChange={(e) => setEditHeadline(e.target.value)}
              placeholder="Short explanation hook"
            />
          </div>

          <div className="space-y-1 select-none">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">Post Status State</label>
            <div className="flex p-1 bg-surface rounded-xl border border-border-accent/40 max-w-sm">
              {['planned', 'draft', 'posted'].map((status) => (
                <button
                  key={status}
                  onClick={() => setEditStatus(status as any)}
                  className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-extrabold rounded-lg transition-all ${
                    editStatus === status
                      ? 'bg-accent/15 text-accent shadow-sm border border-accent/20'
                      : 'text-muted hover:text-text-main'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border-accent/35 pt-4">
            <Button variant="ghost" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSaveEditItem} className="font-bold">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
