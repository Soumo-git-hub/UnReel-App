'use client';

import React from 'react';
import { m } from 'framer-motion';
import { ExternalLink, Clock, History, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import styles from './HistoryPanel.module.css';

interface HistoryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  data: any[];
  isLoading: boolean;
  isAnalysisPage?: boolean;
  user: any;
  onLogin: () => void;
  hideHandle?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onToggle, 
  data, 
  isLoading, 
  isAnalysisPage, 
  user, 
  onLogin,
  hideHandle 
}) => {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();

  return (
    <m.div 
      initial={false}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ 
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1]
      }}
      className={styles.panel}
    >
      {/* Attached Toggle Handle outside panel bounding box */}
      {!hideHandle && (
        <m.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 255, 255, 0.9)',
            color: isOpen ? (resolvedTheme === 'dark' ? '#00ffff' : '#0D9488') : '#000'
          }}
          exit={{ opacity: 0, x: -20 }}
          className={`${styles.handle} ${isAnalysisPage ? styles.analysisHandle : ''}`} 
          onClick={onToggle}
          title="History"
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <m.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X size={22} /> : <History size={22} />}
          </m.div>
        </m.button>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <Clock size={20} className={styles.titleIcon} />
            <h2>History</h2>
          </div>
        </div>

        <div className={styles.list}>
          {!user ? (
            <div className={styles.authAction}>
              <h3>Sign in to see your history</h3>
              <p>Keep track of all your past analyses and pick up where you left off.</p>
              <button className={styles.authBtn} onClick={onLogin}>
                Login or Sign Up
              </button>
            </div>
          ) : isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className={styles.skeletonPulse} style={{ 
                animationDelay: `${i * 0.1}s`,
                opacity: 1 - (i * 0.15)
              }} />
            ))
          ) : data.length > 0 ? (
            <m.div 
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
              variants={{
                visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
                hidden: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {data.map((item) => {
                const getPlatformInfo = (url: string) => {
                  const lowUrl = (url || '').toLowerCase();
                  if (lowUrl.includes('instagram.com')) return 'Instagram';
                  if (lowUrl.includes('tiktok.com')) return 'TikTok';
                  if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'YouTube';
                  return 'Video';
                };

                const platform = getPlatformInfo(item.originalUrl || item.videoUrl);
                const title = item.metadata?.uploader 
                  ? `Video by ${item.metadata.uploader}` 
                  : `Analysis on ${platform}`;

                return (
                  <m.div 
                    key={item.analysisId} 
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: { x: 0, opacity: 1 }
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    whileTap={{ scale: 0.98 }}
                    className={styles.item}
                    onClick={() => {
                      window.open(`/analysis/${item.analysisId}`, '_blank', 'noopener,noreferrer');
                      onToggle();
                    }}
                  >
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>{title}</span>
                        <ExternalLink size={14} className={styles.jumpIcon} />
                      </div>
                      <div className={styles.itemMeta}>
                        <span className={styles.platformBadge}>{platform}</span>
                        <span className={styles.dot}>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </m.div>
          ) : (
            <div className={styles.emptyState}>
              <p>No analyses yet.</p>
              <span>Your past work will appear here once you analyze your first video.</span>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
};

export default HistoryPanel;
