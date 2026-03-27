'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SendHorizontal, Loader2, History, X, ExternalLink } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { analyzeVideo, listHistory } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { User } from 'firebase/auth';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('./Auth/AuthModal'), { ssr: false });
const ProcessScreen = dynamic(() => import('./ProcessScreen'), { ssr: false });
const HistoryPanel = dynamic(() => import('./HistoryPanel'), { ssr: false });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false });

import styles from './Hero.module.css';

type AnalysisState = 'idle' | 'submitting' | 'processing';

const Hero: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, newUser?: User) => {
    e?.preventDefault();
    if (!url.trim()) return;

    if (!user && !newUser) {
      setShowAuthModal(true);
      return;
    }

    setAnalysisState('processing');
    setError(null);
    setResultData(null);

    try {
      const result = await analyzeVideo(url, newUser || user);
      setResultData(result);
      sessionStorage.setItem('last_analysis', JSON.stringify(result));
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to analyze video. Please check your connection.');
      setAnalysisState('idle');
    }
  };

  const handleProcessComplete = () => {
    const analysisId = resultData?.analysisId || 'latest';
    router.push(`/analysis/${analysisId}`);
  };

  // Prefetch history on user login or change
  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setHistoryData([]);
        return;
      }
      
      // If we already have data, we'll refresh it in the background
      // but only show loading state if we have nothing
      if (historyData.length === 0) setHistoryLoading(true);
      
      try {
        const data = await listHistory(user);
        setHistoryData(data);
      } catch (err) {
        console.error('History prefetch failed:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchHistory();
    }, 1500);

    return () => clearTimeout(timer);

    // Refresh history if a new analysis is completed
  }, [user, resultData?.analysisId]);

  const handleToggleHistory = async () => {
    if (!showHistory) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setShowHistory(true);
      setShowSettings(false);
      
      try {
        const data = await listHistory(user);
        setHistoryData(data);
      } catch (err) {
        console.error('History refresh failed:', err);
      }
    } else {
      setShowHistory(false);
    }
  };

  const handleToggleSettings = () => {
    setShowSettings(prev => !prev);
    setShowHistory(false);
  };

  if (analysisState === 'processing') {
    return <ProcessScreen onComplete={handleProcessComplete} isReady={!!resultData} />;
  }

  return (
    <div className={`${styles.hero} ${analysisState !== 'idle' ? styles.heroActive : ''}`}>


      <m.div 
        layout
        className={styles.centerSection}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <m.h1 layout className={styles.logo}>UnReel</m.h1>
        
        <AnimatePresence>
          {analysisState === 'idle' && (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.instructionContainer}
            >
              <p className={styles.primary}>Tap to paste your video link</p>
              <p className={styles.secondary}>and watch the magic unfold</p>
            </m.div>
          )}
        </AnimatePresence>

        <m.form 
          layout
          onSubmit={handleSubmit} 
          className={styles.inputWrapper} 
          data-error={!!error}
        >
          <input 
            type="text" 
            placeholder="Ask a question or paste link..." 
            className={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={analysisState === 'submitting'}
          />
          <button 
            type="submit" 
            className={styles.sendButton} 
            disabled={analysisState === 'submitting'} 
            aria-label="Send"
          >
            {analysisState === 'submitting' ? (
              <Loader2 size={20} className={styles.spin} />
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </m.form>

        {error && <p className={styles.errorText}>{error}</p>}

        <AnimatePresence>
          {analysisState === 'idle' && (
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.suggestions}
            >
              <button className={styles.suggestionBtn}>What's the context?</button>
              <button className={styles.suggestionBtn}>Translate this video</button>
            </m.div>
          )}
        </AnimatePresence>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={async (u) => {
            setShowAuthModal(false);
            // Small delay for smooth transition
            setTimeout(() => {
              handleSubmit(undefined, u);
            }, 500);
          }} 
        />
      </m.div>

      <HistoryPanel 
        isOpen={showHistory} 
        onToggle={handleToggleHistory}
        data={historyData} 
        isLoading={historyLoading} 
      />

      <SettingsPanel 
        isOpen={showSettings} 
        onToggle={handleToggleSettings} 
      />
    </div>
  );
};

export default Hero;
