import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

// Custom Markdown-like formatter for bullet points, bolding, and code snippets
function FormattedMessageContent({ text, isStreaming = false }: { text: string; isStreaming?: boolean }) {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  const parseInlineStyles = (content: string) => {
    // Escape standard safety and parse code & bold strings
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const value = part.slice(2, -2);
        return <strong key={index} className="font-bold text-text-main font-syne">{value}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const value = part.slice(1, -1);
        return (
          <code key={index} className="px-1.5 py-0.5 rounded text-xs font-mono bg-surface border border-border-accent/40 text-bright">
            {value}
          </code>
        );
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1 text-text-main/80 select-text">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm font-sans leading-relaxed">{parseInlineStyles(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Check for bullets
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else {
      if (inList) {
        flushList(lineIdx);
      }

      if (trimmed === '') {
        // Empty lines act as separators
        renderedElements.push(<div key={`gap-${lineIdx}`} className="h-2" />);
      } else {
        // Standard paragraph lines
        renderedElements.push(
          <p key={lineIdx} className="text-sm font-sans text-text-main/90 leading-relaxed select-text">
            {parseInlineStyles(line)}
          </p>
        );
      }
    }
  });

  if (inList) {
    flushList(lines.length);
  }

  return (
    <div className="space-y-1">
      {renderedElements}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent/80 animate-pulse font-mono align-middle">|</span>
      )}
    </div>
  );
}

// Bouncing Dot animation configuration
const dotTransition = {
  duration: 0.6,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as any,
};

export const ChatBubble = React.memo(
  ({ message, isStreaming = false }: ChatBubbleProps) => {
    const isUser = message.role === 'user';

    return (
      <div className={cn('flex w-full mb-4 items-end gap-3', isUser ? 'justify-end' : 'justify-start')}>
        {/* Monogram profile initials left */}
        {!isUser && (
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-accent/15 border border-accent/35 font-syne text-xs font-extrabold text-accent select-none">
            E
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'max-w-[85%] md:max-w-[70%] p-4 select-text leading-relaxed relative',
            isUser
              ? 'bg-accent/15 border border-accent/25 rounded-2xl rounded-br-sm text-text-main font-sans'
              : 'bg-transparent text-text-main text-left'
          )}
        >
          <FormattedMessageContent text={message.content} isStreaming={isStreaming} />
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Bubble memoized comparisons
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.role === nextProps.message.role &&
      prevProps.isStreaming === nextProps.isStreaming
    );
  }
);

ChatBubble.displayName = 'ChatBubble';

// Staggered Bouncing Typing Indicator
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 w-full mb-4 justify-start pl-1 select-none">
      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-accent/15 border border-accent/35 font-syne text-xs font-extrabold text-accent">
        E
      </div>
      <div className="bg-surface/40 border border-border-accent/30 rounded-2xl p-4 flex items-center gap-1.5 h-11">
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ ...dotTransition, delay: 0 }}
          className="h-2 w-2 rounded-full bg-accent"
        />
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ ...dotTransition, delay: 0.15 }}
          className="h-2 w-2 rounded-full bg-accent"
        />
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ ...dotTransition, delay: 0.3 }}
          className="h-2 w-2 rounded-full bg-accent"
        />
      </div>
    </div>
  );
}
