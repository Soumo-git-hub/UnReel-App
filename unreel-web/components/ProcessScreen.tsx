'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Zap, Search, MessageSquare, Image, ShieldCheck } from 'lucide-react';
import styles from './ProcessScreen.module.css';

const STEPS = [
  { id: 'fetch', icon: Search, text: "Fetching video data...", subtext: "Connecting to Instagram servers" },
  { id: 'audio', icon: Zap, text: "Extracting audio...", subtext: "Preparing for speech-to-text" },
  { id: 'vision', icon: Image, text: "Analyzing visuals...", subtext: "Understanding scenes and objects" },
  { id: 'transcribe', icon: MessageSquare, text: "Transcribing speech...", subtext: "Converting audio to text insights" },
  { id: 'ai', icon: ShieldCheck, text: "AI Synthesis...", subtext: "Generating your deep analysis" }
];

interface ProcessScreenProps {
  onComplete: () => void;
  isReady?: boolean;
}

const ProcessScreen: React.FC<ProcessScreenProps> = ({ onComplete, isReady = true }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Standard step progression
    if (currentStep < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000); // 3s per step for the first 4 steps
      return () => clearTimeout(timer);
    } 
    
    // Final step logic: Wait for isReady
    if (currentStep === STEPS.length - 1 && isReady) {
      // Small delay for the final "Success" feel before transition
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete, isReady]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.visualizer}>
          <div className={styles.glow} />
          <m.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={styles.mainCircle}
          >
            <div className={styles.cssSpinner} />
          </m.div>
          <AnimatePresence mode="wait">
            <m.div 
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className={styles.stepIcon}
            >
              {React.createElement(STEPS[currentStep].icon, { size: 48 })}
            </m.div>
          </AnimatePresence>
        </div>

        <div className={styles.textContainer}>
          <AnimatePresence mode="wait">
            <m.div 
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={styles.stepContent}
            >
              <h2 className={styles.stepTitle}>{STEPS[currentStep].text}</h2>
              <p className={styles.stepSubtext}>{STEPS[currentStep].subtext}</p>
            </m.div>
          </AnimatePresence>
        </div>

        <div className={styles.progressTrack}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessScreen;
