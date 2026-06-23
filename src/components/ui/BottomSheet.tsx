import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  // Lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.8 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 140) {
                onClose();
              }
            }}
            className={cn(
              'relative z-10 w-full max-w-xl rounded-t-3xl border-t border-border-accent bg-surface p-6 shadow-2xl pb-safe-bottom md:rounded-2xl md:border md:mb-6 md:w-[94%]',
              className
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center mb-4 cursor-grab active:cursor-grabbing">
              <div className="h-1.5 w-16 rounded-full bg-border-accent/80 hover:bg-muted" />
            </div>

            {/* Header section */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-accent/30">
              {title ? (
                <h3 className="font-syne font-bold text-lg text-text-main tracking-tight">
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full min-w-[36px] min-h-[36px] p-1 text-muted hover:text-text-main"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sheet content body */}
            <div className="overflow-y-auto max-h-[60vh] pb-6 select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
