'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SendHorizontal, Loader2, History, X, ExternalLink } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { analyzeVideo, listHistory } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { User } from 'firebase/auth';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('@/components/Auth/AuthModal'), { ssr: false });
const ProcessScreen = dynamic(() => import('./ProcessScreen'), { ssr: false });
const HistoryPanel = dynamic(() => import('./HistoryPanel'), { ssr: false });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false });

import styles from './Hero.module.css';

type AnalysisState = 'idle' | 'submitting' | 'processing';

const ALL_SUGGESTIONS = [
  "What's the context?",
  "Translate this video",
  "Summarize key moments",
  "Emotional lens",
  "AI Music Identifier",
  "Fact check claims",
  "Identify products",
  "Create blog post",
  "Who is the speaker?",
  "Analyze visual style",
  "Extract recipes/steps",
  "Explain like I'm five"
];

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
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(ALL_SUGGESTIONS.slice(0, 4));

  useEffect(() => {
    // Reset state on mount to handle back-navigation cleanup
    setAnalysisState('idle');
    setResultData(null);
    setUrl(''); 
    
    // Client-side only shuffle to avoid hydration mismatch
    const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 4);
    setActiveSuggestions(shuffled);
  }, []);

  const validateLink = (url: string) => {
    const lowerUrl = url.toLowerCase().trim();
    if (!lowerUrl.startsWith('http')) return 'chat_attempt';
    
    const isInsta = lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am');
    const isYoutube = lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
    const isX = lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com');
    const isLinkedin = lowerUrl.includes('linkedin.com');
    const isTikTok = lowerUrl.includes('tiktok.com');
                      
    if (isInsta || isYoutube || isX || isLinkedin || isTikTok) return 'valid';
    return 'unsupported';
  };

  const handleSubmit = async (e?: React.FormEvent, newUser?: User) => {
    e?.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    if (!user && !newUser) {
      setShowAuthModal(true);
      return;
    }

    const linkStatus = validateLink(trimmedUrl);
    
    if (linkStatus === 'chat_attempt') {
      setToast({ message: "Paste a video link to start analysis and chatting", type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    
    if (linkStatus === 'unsupported') {
      setToast({ message: "Platform not supported! Use Instagram, YouTube, X, or LinkedIn.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    let platform = 'Video';
    if (trimmedUrl.includes('instagram.com') || trimmedUrl.includes('instagr.am')) platform = 'Instagram';
    if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) platform = 'YouTube';
    if (trimmedUrl.includes('x.com') || trimmedUrl.includes('twitter.com')) platform = 'X (Twitter)';
    if (trimmedUrl.includes('linkedin.com')) platform = 'LinkedIn';
    
    setToast({ 
      message: `${platform} Link Detected... Start Analysis`, 
      type: 'success' 
    });
    setTimeout(() => setToast(null), 3000);

    setAnalysisState('processing');
    setError(null);
    setResultData(null);

    try {
      let lenses = undefined;
      const savedLenses = localStorage.getItem('unreel_lenses');
      if (savedLenses) {
        try {
          lenses = JSON.parse(savedLenses);
        } catch (e) {}
      }

      const result = await analyzeVideo(trimmedUrl, newUser || user, lenses);
      setResultData(result);
      sessionStorage.setItem('last_analysis', JSON.stringify(result));
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisState('idle');
      const msg = err.message || "Invalid or broken video link";
      setToast({ message: msg.includes('download') ? "Invalid video link" : msg, type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleProcessComplete = () => {
    const analysisId = resultData?.analysisId || 'latest';
    router.push(`/analysis/${analysisId}`);
  };

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setHistoryData([]);
        return;
      }
      
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
  }, [user, resultData?.analysisId]);

  const handleToggleHistory = async () => {
    if (!showHistory) {
      setShowHistory(true);
      setShowSettings(false);
      
      if (user) {
        try {
          const data = await listHistory(user);
          setHistoryData(data);
        } catch (err) {
          console.error('History refresh failed:', err);
        }
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
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${styles.hero} ${analysisState !== 'idle' ? styles.heroActive : ''}`}
    >
      <AnimatePresence>
        {toast && (
          <m.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`${styles.toast} ${styles[toast.type]}`}
          >
            {toast.message}
          </m.div>
        )}
      </AnimatePresence>


      <div className={styles.centerSection}>
        <m.div 
          className={styles.logoContainer}
          onClick={async () => {
            try {
              const text = await navigator.clipboard.readText();
              if (!text || !text.trim().startsWith('http')) {
                setToast({ message: "Copy a Reel or YouTube Short link first", type: 'error' });
                setTimeout(() => setToast(null), 3500);
                return;
              }
              setUrl(text);
              setToast({ message: "Link pasted", type: 'success' });
              setTimeout(() => setToast(null), 2000);
              
              const logo = document.querySelector(`.${styles.logo}`);
              logo?.animate([
                { transform: 'scale(1)', filter: 'brightness(1)' },
                { transform: 'scale(1.05)', filter: 'brightness(1.5) drop-shadow(0 0 12px rgba(0, 255, 255, 0.3))' },
                { transform: 'scale(1)', filter: 'brightness(1)' }
              ], { duration: 400, easing: 'ease-out' });
            } catch (err: any) {
              console.error('Failed to read clipboard:', err);
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Image 
            src="/UnReel-Logo.png" 
            alt="UnReel" 
            className={styles.logo} 
            width={120} 
            height={120} 
            priority
            fetchPriority="high"
          />
          <h1 className={styles.logoText}>UnReel</h1>
        </m.div>

        <m.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={styles.instructionContainer}
        >
          <p className={styles.primary}>Tap to paste your video link</p>
          <p className={styles.secondary}>and watch the magic unfold</p>
        </m.div>
        
        <m.form 
          layout
          onSubmit={handleSubmit} 
          className={styles.inputWrapper} 
          data-error={!!error}
        >
          <input 
            type="text" 
            placeholder={analysisState === 'idle' ? "Paste a link from Instagram, YouTube, X, or LinkedIn..." : "Ask me anything about this video..."} 
            className={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={analysisState === 'submitting'}
          />
          <button 
            type="submit" 
            className={styles.sendButton} 
            disabled={analysisState === 'submitting'} 
          >
            {analysisState === 'submitting' ? (
              <Loader2 size={20} className={styles.spin} />
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </m.form>

        <AnimatePresence>
          {analysisState === 'idle' && (
            <m.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={styles.suggestions}
            >
              {activeSuggestions.map((text) => (
                <button 
                  key={text} 
                  className={styles.suggestionBtn}
                  onClick={() => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
                      setToast({ message: "Paste a Reel or YouTube Short link first", type: 'error' });
                      setTimeout(() => setToast(null), 3500);
                      return;
                    }
                    handleSubmit();
                  }}
                >
                  {text}
                </button>
              ))}
            </m.div>
          )}
        </AnimatePresence>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={async (u) => {
            setShowAuthModal(false);
            setTimeout(() => {
              handleSubmit(undefined, u);
            }, 500);
          }} 
        />
      </div>

      <HistoryPanel 
        isOpen={showHistory} 
        onToggle={handleToggleHistory}
        data={historyData} 
        isLoading={historyLoading} 
        user={user}
        onLogin={() => { setShowAuthModal(true); setShowHistory(false); }}
        hideHandle={showAuthModal}
      />

      <SettingsPanel 
        isOpen={showSettings} 
        onToggle={handleToggleSettings} 
        onLogin={() => { setShowAuthModal(true); setShowSettings(false); }}
        hideHandle={showAuthModal}
      />
    </m.div>
  );
};

export default Hero;
