import React from 'react';
import { motion } from 'motion/react';

interface StepWrapperProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  direction: number; // 1 for next, -1 for previous
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '5vw' : '-5vw',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-5vw' : '5vw',
    opacity: 0,
  }),
};

export function StepWrapper({ children, currentStep, totalSteps, direction }: StepWrapperProps) {
  const percentComplete = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-bg glow-bg px-4 py-8 md:py-12">
      {/* Top progress bar indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-surface z-50">
        <motion.div
          className="h-full bg-accent shadow-[0_0_8px_rgba(34,197,94,0.7)]"
          initial={{ width: '0%' }}
          animate={{ width: `${percentComplete}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Slide body with content frames */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg mx-auto py-10">
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full flex flex-col"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
