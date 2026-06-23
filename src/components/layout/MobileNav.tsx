import { Home, Sparkles, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TabType = 'home' | 'suggest' | 'trends' | 'calendar' | 'chat' | 'settings';

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'suggest', label: 'Suggest', icon: Sparkles },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-surface/90 backdrop-blur-md border border-border-accent px-2 rounded-2xl shadow-2xl max-w-lg mx-auto select-none transition-all">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center w-14 h-full transition-all active:scale-90',
                isActive ? 'text-accent' : 'text-muted hover:text-text-main'
              )}
            >
              {/* Active Dot above icon */}
              {isActive && (
                <span className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}
              <Icon className="h-5 w-5 mt-1.5" />
              <span className="text-[9px] uppercase font-mono mt-1 font-semibold select-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
