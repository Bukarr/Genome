import { Home, Sparkles, TrendingUp, Calendar, MessageSquare, Settings } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';
import { cn } from '../../lib/utils';
import { TabType } from './MobileNav';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { profile } = useProfileStore();

  const navItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'suggest', label: 'AI Suggest', icon: Sparkles },
    { id: 'trends', label: 'Live Trends', icon: TrendingUp },
    { id: 'calendar', label: 'Calendar Planner', icon: Calendar },
    { id: 'chat', label: 'Slick Chat AI', icon: MessageSquare },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ] as const;

  // Get User Initials for Avatar
  const getInitials = () => {
    if (!profile?.name) return 'GN';
    return profile.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-border-accent/45 z-40">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center gap-2">
        <span className="font-syne font-extrabold text-accent select-none text-2xl tracking-tight">
          Genome<span className="text-text-main">.</span>
        </span>
      </div>

      {/* Navigation Rows */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 list-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 outline-none select-none text-left active:scale-[0.98]',
                isActive
                  ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_1px_0_0_var(--accent)]'
                  : 'text-muted hover:bg-card/45 hover:text-text-main'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Information Block at the bottom */}
      <div className="p-4 border-t border-border-accent/40 bg-bg/40">
        {profile ? (
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-surface text-left transition-all group select-none active:scale-[0.98]"
          >
            {/* Initials Avatar */}
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-accent/20 border border-accent/40 font-mono text-sm font-bold text-accent group-hover:bg-accent/30 transition-all select-none">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-main truncate group-hover:text-bright transition-all">
                {profile.name}
              </p>
              <p className="text-[10px] text-muted font-mono truncate uppercase">
                {profile.niche}
              </p>
            </div>
          </button>
        ) : (
          <div className="py-2 text-center text-xs text-muted font-mono">
            NOT LOGGED IN
          </div>
        )}
      </div>
    </div>
  );
}
