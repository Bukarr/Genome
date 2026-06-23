import React, { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Clock, Edit3, Trash2, Plus, Sparkles, Check, AlertCircle } from 'lucide-react';
import { CalendarItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { BottomSheet } from '../ui/BottomSheet';
import { cn } from '../../lib/utils';

interface CalendarGridProps {
  items: CalendarItem[];
  onEditItem: (item: CalendarItem) => void;
  onDeleteItem: (id: string) => void;
  onGeneratePost: (item: CalendarItem) => void;
  onAddItemClick: () => void;
}

export function CalendarGrid({
  items,
  onEditItem,
  onDeleteItem,
  onGeneratePost,
  onAddItemClick,
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'month' | 'list'>('month');
  const [selectedDayItems, setSelectedDayItems] = useState<CalendarItem[]>([]);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [selectedDayLabel, setSelectedDayLabel] = useState('');

  // 1. Calculations for Monthly Grid View
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const daysInGrid = useMemo(() => {
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [gridStart, gridEnd]);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const filtered = items.filter((item) => item.date === dayStr);
    
    if (filtered.length > 0) {
      setSelectedDayItems(filtered);
      setSelectedDayLabel(format(day, 'eeee, MMMM d, yyyy'));
      setIsDayDrawerOpen(true);
    }
  };

  // 2. Calculations for Chronological List View grouped by week start Date
  const groupedWeeks = useMemo(() => {
    // Sort items chronologically
    const sortedItems = [...items].sort((a, b) => a.date.localeCompare(b.date));
    
    const weeks: { [weekLabel: string]: CalendarItem[] } = {};
    
    sortedItems.forEach((item) => {
      try {
        const itemDate = parseISO(item.date);
        const weekStart = startOfWeek(itemDate);
        const label = `Week of ${format(weekStart, 'MMMM d, yyyy')}`;
        
        if (!weeks[label]) {
          weeks[label] = [];
        }
        weeks[label].push(item);
      } catch (e) {
        // Fallback in case of parsing errors
        const labelStr = 'Upcoming Schedule';
        if (!weeks[labelStr]) weeks[labelStr] = [];
        weeks[labelStr].push(item);
      }
    });
    
    return Object.entries(weeks);
  }, [items]);

  // Helpers for status indicator
  const getStatusMeta = (status: CalendarItem['status']) => {
    switch (status) {
      case 'posted':
        return { variant: 'accent' as const, icon: Check, label: 'Posted' };
      case 'draft':
        return { variant: 'warning' as const, icon: Edit3, label: 'Draft' };
      case 'planned':
      default:
        return { variant: 'muted' as const, icon: Clock, label: 'Planned' };
    }
  };

  const getPriorityColor = (priority: CalendarItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10 border-error/25';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning/25';
      case 'low':
        return 'text-muted bg-surface border-border-accent/40';
      default:
        return 'text-muted bg-surface';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Switch Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg/20 p-2 rounded-2xl border border-border-accent/30">
        <div className="flex p-1 bg-surface rounded-xl border border-border-accent/30 self-stretch sm:self-auto select-none">
          <button
            onClick={() => setActiveTab('month')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all outline-none',
              activeTab === 'month' ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text-main'
            )}
          >
            <Calendar className="h-4 w-4" /> Month Grid
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all outline-none',
              activeTab === 'list' ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text-main'
            )}
          >
            <List className="h-4 w-4" /> Scheduler List
          </button>
        </div>

        {/* Calendar visual controls */}
        {activeTab === 'month' && (
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between select-none">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-syne font-bold text-center text-text-main text-base uppercase tracking-wider min-w-[130px]" id="calendarHeaderMonth">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* --- Tab Content --- */}
      {activeTab === 'month' ? (
        <div className="border border-border-accent/45 rounded-2xl bg-card/15 p-4 overflow-hidden shadow-xl select-none">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-muted font-bold uppercase pb-3 border-b border-border-accent/30 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {daysInGrid.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const hasContent = items.some((item) => item.date === dayStr);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'relative aspect-square flex flex-col items-center justify-center p-1 rounded-xl border border-transparent transition-all outline-none',
                    hasContent ? 'bg-accent/5 border-accent/20 cursor-pointer hover:bg-accent/10 active:scale-95' : 'bg-surface/30',
                    isCurrentDay && 'ring-1 ring-accent bg-accent/5',
                    !isCurrentMonth && 'opacity-25'
                  )}
                >
                  {/* Grid Date Label */}
                  <span
                    className={cn(
                      'text-xs font-mono font-medium',
                      isCurrentDay ? 'text-accent font-bold' : isCurrentMonth ? 'text-text-main' : 'text-muted'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Scheduled Dot */}
                  {hasContent && (
                    <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="text-center py-6 mt-4 border-t border-dashed border-border-accent/30 leading-relaxed text-xs text-muted font-mono list-none uppercase">
              No items scheduled yet. Use "+" button to generate your calendar!
            </div>
          )}
        </div>
      ) : (
        /* --- List grouped view --- */
        <div className="space-y-6">
          {groupedWeeks.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border-accent/30 bg-surface/10">
              <Calendar className="h-8 w-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-text-main font-medium">Your Calendar planning is empty</p>
              <p className="text-xs text-muted mb-4 font-mono mt-1">Generate a schedule of upcoming posts with Gemini AI</p>
              <Button variant="primary" size="md" onClick={onAddItemClick} className="font-bold">
                <Plus className="h-4 w-4 mr-1.5" /> Initialize Schedule
              </Button>
            </div>
          ) : (
            groupedWeeks.map(([weekLabel, weekItems]) => (
              <div key={weekLabel} className="space-y-3">
                {/* Week Heading */}
                <h3 className="sticky top-14 z-10 bg-bg/85 backdrop-blur-md font-mono text-[10px] text-accent uppercase tracking-widest font-bold py-1 px-3 border border-border-accent/40 rounded-full inline-block select-none">
                  {weekLabel}
                </h3>

                {/* Week Schedule List */}
                <div className="space-y-3">
                  {weekItems.map((item) => {
                    const statusMeta = getStatusMeta(item.status);
                    const StatusIcon = statusMeta.icon;

                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-card border border-border-accent/40 hover:border-accent/30 transition-all gap-4"
                      >
                        {/* Post metadata and Teaser */}
                        <div className="flex-1 space-y-2 select-text">
                          <div className="flex flex-wrap items-center gap-2 select-none">
                            <span className="font-mono text-xs text-muted">
                              {format(parseISO(item.date), 'eee, MMM d')}
                            </span>
                            <Badge variant="accent">{item.platform}</Badge>
                            <Badge variant="default">{item.format}</Badge>
                            <span
                              className={cn(
                                'text-[10px] font-mono px-2 py-0.5 border rounded',
                                getPriorityColor(item.priority)
                              )}
                            >
                              {item.priority.toUpperCase()}
                            </span>
                          </div>

                          <h4 className="font-syne font-bold text-text-main text-sm md:text-md leading-snug">
                            {item.topic}
                          </h4>
                          <p className="text-xs text-text-main/70 italic leading-relaxed font-sans">
                            "{item.headline}"
                          </p>
                        </div>

                        {/* Status elements and action items */}
                        <div className="flex flex-wrap items-center gap-2 select-none self-end md:self-auto">
                          {/* Colored Status Chip */}
                          <Badge variant={statusMeta.variant} className="flex gap-1.5 items-center">
                            <StatusIcon className="h-3 w-3" />
                            {statusMeta.label}
                          </Badge>

                          {/* Quick Actions Panel */}
                          <div className="flex items-center gap-1">
                            {/* Generate full draft button */}
                            {item.status !== 'posted' && (
                              <Button
                                variant="accent"
                                size="sm"
                                onClick={() => onGeneratePost(item)}
                                className="h-8 py-1 px-2.5 font-bold flex gap-1 whitespace-nowrap"
                                title="Generate Full Draft Post"
                              >
                                <Sparkles className="h-3.5 w-3.5" /> Post Draft
                              </Button>
                            )}

                            {/* Edit settings */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditItem(item)}
                              title="Edit item information"
                              className="h-8 w-8 p-1 text-muted hover:text-bright hover:bg-surface"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>

                            {/* Remove scheduled item */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteItem(item.id)}
                              title="Remove scheduled post"
                              className="h-8 w-8 p-1 text-muted hover:text-error hover:bg-surface"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- Monthly Grid Day Drawer Drawer --- */}
      <BottomSheet
        isOpen={isDayDrawerOpen}
        onClose={() => setIsDayDrawerOpen(false)}
        title={selectedDayLabel}
      >
        <div className="space-y-4">
          {selectedDayItems.map((item) => {
            const statusMeta = getStatusMeta(item.status);
            const StatusIcon = statusMeta.icon;
            return (
              <div
                key={item.id}
                className="p-4 bg-card/60 border border-border-accent/40 rounded-xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="accent">{item.platform}</Badge>
                    <Badge variant="default">{item.format}</Badge>
                  </div>
                  <Badge variant={statusMeta.variant} className="flex gap-1 items-center font-mono">
                    <StatusIcon className="h-3 w-3" /> {statusMeta.label}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="font-syne font-bold text-sm text-text-main leading-snug">
                    {item.topic}
                  </h4>
                  <p className="text-xs text-text-main/70 italic font-sans leading-relaxed">
                    "{item.headline}"
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border-accent/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsDayDrawerOpen(false);
                      onEditItem(item);
                    }}
                    className="h-8 py-1.5 text-xs text-muted hover:text-text-main"
                  >
                    Edit Detail
                  </Button>
                  {item.status !== 'posted' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setIsDayDrawerOpen(false);
                        onGeneratePost(item);
                      }}
                      className="h-8 py-1.5 text-xs font-bold"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Draft Post
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
