
import React, { useEffect, useState, useRef } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const DURATION = 5000; // 5 seconds is a sweet spot for compact toasts

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(DURATION);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTimeRef.current);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    startTimer();
  };

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      setIsLeaving(false);
      setIsPaused(false);
      remainingTimeRef.current = DURATION;
      
      startTimer();

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [toast]);

  const handleClose = () => {
    setIsLeaving(true);
    // Wait for the slide-out animation to finish (500ms matches CSS duration)
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500); 
  };

  if (!toast && !isVisible) {
    return null;
  }

  const isSuccess = toast?.type === 'success';
  const title = isSuccess ? 'Success' : 'Error';
  
  // Subtle background colors for icon container
  const iconWrapperClass = isSuccess 
    ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
    : "bg-red-500 text-white shadow-lg shadow-red-500/30";
    
  const progressBarClass = isSuccess ? "bg-green-500" : "bg-red-500";

  // Animation Logic:
  // Mobile: Slide Down (-translate-y-8 to 0)
  // Desktop: Slide Left (translate-x-full to 0)
  const animationClasses = isVisible && !isLeaving
    ? "translate-y-0 opacity-100 md:translate-x-0" 
    : "-translate-y-8 opacity-0 md:translate-y-0 md:translate-x-[120%] md:opacity-0";

  return (
    <div className="fixed z-[100] pointer-events-none flex flex-col gap-2 top-4 left-4 right-4 md:left-auto md:top-6 md:right-6 md:bottom-auto">
       {/* Container */}
       <div 
          onMouseEnter={pauseTimer}
          onMouseLeave={resumeTimer}
          onTouchStart={pauseTimer}
          onTouchEnd={resumeTimer}
          className={`
            pointer-events-auto relative overflow-hidden w-full md:w-80
            bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl
            border border-gray-100 dark:border-gray-700
            rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50
            p-3 pr-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${animationClasses}
          `}
       >
          <div className="flex gap-3 items-center">
            {/* Icon - Compact & Vibrant */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${iconWrapperClass}`}>
               {isSuccess ? (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
               ) : (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               )}
            </div>

            {/* Content - Compact Layout */}
            <div className="flex-1 min-w-0">
               <h4 className={`text-sm font-bold truncate ${isSuccess ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                 {title}
               </h4>
               <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight line-clamp-2">
                 {toast?.message}
               </p>
            </div>
          </div>

          {/* Close Button - Subtle */}
          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
          >
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>

          {/* Progress Bar - Thin Line at Bottom */}
          {isVisible && !isLeaving && (
             <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100 dark:bg-gray-700/50">
                <div 
                  className={`h-full ${progressBarClass} transition-all ease-linear shadow-[0_0_10px_currentColor]`} 
                  style={{ 
                      width: '100%',
                      animationName: 'progress',
                      animationDuration: `${DURATION}ms`,
                      animationTimingFunction: 'linear',
                      animationFillMode: 'forwards',
                      animationPlayState: isPaused ? 'paused' : 'running'
                  }}
                />
             </div>
          )}
       </div>
       
       <style>{`
         @keyframes progress {
           from { width: 100%; }
           to { width: 0%; }
         }
       `}</style>
    </div>
  );
};

export default Toast;
