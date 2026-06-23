import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Lock body scroll when open
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/85 backdrop-blur-md"
          />

          {/* Dialog Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={cn(
              'relative z-10 w-full max-w-lg rounded-2xl border border-border-accent bg-card p-6 shadow-2xl glow-bg',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-accent/45 pb-4 mb-4">
              {title ? (
                <h3 className="font-syne font-bold text-lg text-text-main tracking-tight leading-none">
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full min-w-[36px] min-h-[36px] p-1.5 hover:bg-surface text-muted hover:text-text-main"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto max-h-[75vh] select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
