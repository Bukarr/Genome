import { Flame, TrendingUp, Zap } from 'lucide-react';
import { TrendItem } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TrendCardProps {
  trend: TrendItem;
  onCreateContent: (topic: string) => void;
}

export function TrendCard({ trend, onCreateContent }: TrendCardProps) {
  const isHot = trend.momentum === 'hot';

  return (
    <Card className="flex flex-col justify-between h-full bg-card/35 gap-5 select-none hover:border-accent/40 relative group overflow-hidden">
      {/* Spark indicator for hot items */}
      {isHot && (
        <div className="absolute top-0 right-0 h-12 w-12 bg-error/15 rounded-bl-full flex items-start justify-end p-2 text-error animate-pulse">
          <Flame className="h-4 w-4" />
        </div>
      )}

      <div className="space-y-3">
        {/* Momentum Indicator Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {isHot ? (
              <span className="flex items-center gap-1 text-error font-bold">
                <Flame className="h-3.5 w-3.5 fill-current" /> TRENDING NOW
              </span>
            ) : (
              <span className="flex items-center gap-1 text-accent font-bold">
                <TrendingUp className="h-3.5 w-3.5" /> RISING TOPIC
              </span>
            )}
          </div>
        </div>

        {/* Topic Title */}
        <h3 className="font-syne font-bold text-text-main text-md md:text-lg leading-snug tracking-tight group-hover:text-bright transition-colors select-text">
          {trend.topic}
        </h3>

        {/* Core Summary */}
        <p className="text-sm text-text-main/80 leading-relaxed font-sans select-text">
          {trend.summary}
        </p>

        {/* Relevance Block */}
        <div className="space-y-2 pt-1 border-t border-border-accent/35 list-none">
          <div className="leading-relaxed select-text">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted block mb-0.5">
              Relevance to Your Niche
            </span>
            <p className="text-xs text-text-main/75 font-sans leading-relaxed">
              {trend.relevanceReason}
            </p>
          </div>

          {/* Prompt angle */}
          <div className="leading-relaxed bg-bg/40 p-2.5 rounded-lg border border-border-accent/20 select-text">
            <span className="text-[10px] uppercase font-mono tracking-wider text-accent flex items-center gap-1 mb-0.5">
              <Zap className="h-3 w-3" /> Content Angle Recommendation
            </span>
            <p className="text-xs text-text-main/90 font-sans italic leading-relaxed">
              "{trend.contentAngle}"
            </p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <Button
        variant="primary"
        size="md"
        onClick={() => onCreateContent(trend.topic)}
        className="w-full mt-2 font-bold select-none"
      >
        Create Content About This
      </Button>
    </Card>
  );
}
