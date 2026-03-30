'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Zap, Search, MessageSquare, Image, ShieldCheck, Music, Globe, Key } from 'lucide-react';
import styles from './ProcessScreen.module.css';

const STEPS = [
  { id: 'fetch', icon: Search, text: "Fetching video data...", subtext: "Starting secure connection" },
  { id: 'audio', icon: Zap, text: "Extracting audio...", subtext: "Reading the audio track" },
  { id: 'music', icon: Music, text: "Fingerprinting music...", subtext: "Identifying the background music" },
  { id: 'transcribe', icon: MessageSquare, text: "Transcribing speech...", subtext: "Converting speech to text insights" },
  { id: 'vision', icon: Image, text: "Analyzing visuals...", subtext: "Mapping scenes and objects" },
  { id: 'map', icon: Globe, text: "Context mapping...", subtext: "Locating resources and places" },
  { id: 'verify', icon: Key, text: "Source verification...", subtext: "Verifying analysis sources" },
  { id: 'ai', icon: ShieldCheck, text: "AI Synthesis...", subtext: "Generating your deep analysis" }
];

const FUN_FACTS = [
  "Reels with music get 35% more engagement than those without.",
  "The first 3 seconds determine if 70% of viewers stay.",
  "Videos with captions are watched 40% longer on average.",
  "80% of social media users watch videos on mute.",
  "Consistent posting at the same time can boost reach by 20%.",
  "Short-form content has the highest ROI of any format in 2026."
];

interface ProcessScreenProps {
  onComplete: () => void;
  isReady?: boolean;
}

const ProcessScreen: React.FC<ProcessScreenProps> = ({ onComplete, isReady = true }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    // Rotate facts every 6 seconds for engagement
    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % FUN_FACTS.length);
    }, 6000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    // Standard step progression with Intelligent Acceleration
    if (currentStep < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 6000); // Updated to 6s for deeper engagement and fact-reading
      return () => clearTimeout(timer);
    } 
    
    // Final step logic: Wait for isReady
    if (currentStep === STEPS.length - 1 && isReady) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000); // Final "Success" moment
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
            style={{ 
              width: `${
                currentStep < STEPS.length - 1 
                  ? ((currentStep + 1) / STEPS.length) * 90 
                  : isReady 
                    ? 100 
                    : 92 
              }%` 
            }} 
          />
        </div>

        <div className={styles.factBox}>
          <div className={styles.factLabel}>DID YOU KNOW?</div>
          <AnimatePresence mode="wait">
            <m.div 
              key={currentFact}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.factText}
            >
              {FUN_FACTS[currentFact]}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProcessScreen;
