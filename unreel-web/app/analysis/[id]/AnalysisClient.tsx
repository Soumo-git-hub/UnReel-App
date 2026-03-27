'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, BookOpen, Key, Link as LinkIcon, MessageSquare, Globe, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';
import Header from '@/components/Header';
import ChatPanel from './ChatPanel';
import styles from './AnalysisPage.module.css';
import { translateTranscript, getAnalysis } from '@/lib/api';
import ProcessScreen from '@/components/ProcessScreen';

const AnalysisClient = () => {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // First try sessionStorage
      const storedData = typeof window !== 'undefined' ? sessionStorage.getItem('last_analysis') : null;
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.analysisId === params.id || params.id === 'latest') {
          setData(parsed);
          return;
        }
      }

      // If not in session or mismatching ID, fetch from API
      if (params.id && params.id !== 'latest') {
        try {
          const result = await getAnalysis(params.id as string);
          setData(result);
        } catch (err) {
          console.error("Failed to fetch analysis:", err);
          router.push('/');
        }
      }
    };

    fetchData();
  }, [params.id, router]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [selectedLang, setSelectedLang] = useState<string>('hi');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLang(langCode);
    if (!translations[langCode]) {
      setIsTranslating(true);
      try {
        const result = await translateTranscript(data.analysisId, langCode);
        setTranslations(prev => ({ ...prev, [langCode]: result.translatedText }));
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  if (!data) {
    return <ProcessScreen onComplete={() => {}} isReady={!!data} />;
  }

  const result = {
    title: data.metadata?.title || "Untitled Video",
    summary: data.content?.summary || data.analysis || "No summary available.",
    keyTopics: data.content?.keyTopics || [],
    mentionedResources: data.content?.mentionedResources || [],
    fullTranscript: data.fullTranscript || data.content?.fullTranscript || "Transcript not fully processed.",
  };

  return (
    <AuroraBackground>
      <div className={styles.pageContainer}>
        <Header />
        
        <main className={`${styles.main} ${isChatOpen ? styles.mainWithChat : ''}`}>
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.pageHeader}
          >
            <button className={styles.backBtn} onClick={() => router.push('/')}>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <h1 className={styles.title}>{result.title}</h1>
          </m.div>

          <div className={styles.bentoGrid}>
            <m.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${styles.compactCard} ${styles.summaryCard}`}
            >
              <div className={styles.sectionHeader}>
                <BookOpen size={20} className={styles.icon} />
                <h2>Summary</h2>
              </div>
              <p className={styles.summaryText}>{result.summary}</p>
            </m.section>

            <m.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`${styles.compactCard} ${styles.resourcesCard}`}
            >
              <div className={styles.sectionHeader}>
                <LinkIcon size={20} className={styles.icon} />
                <h2>Resources</h2>
              </div>
              <div className={styles.resourceList}>
                {result.mentionedResources.length > 0 ? (
                  result.mentionedResources.map((res: any, i: number) => {
                    const name = typeof res === 'object' ? res.name : String(res);
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(name)}`;
                    return (
                      <a 
                        key={i} 
                        href={googleSearchUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.resourceCard}
                      >
                        <span className={styles.resName}>{name}</span>
                        <ExternalLink size={12} className={styles.resIcon} />
                      </a>
                    );
                  })
                ) : (
                  <p className={styles.emptyText}>No manual resources cited.</p>
                )}
              </div>
            </m.section>


            <m.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`${styles.compactCard} ${styles.topicsCard}`}
            >
              <div className={styles.sectionHeader}>
                <Key size={20} className={styles.icon} />
                <h2>Topics</h2>
              </div>
              <div className={styles.tagGrid}>
                {result.keyTopics.map((topic: string, i: number) => (
                  <span key={i} className={styles.tag}>{topic}</span>
                ))}
              </div>
            </m.section>

            <m.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`${styles.compactCard} ${styles.transcriptCard}`}
            >
              <div className={styles.sectionHeader}>
                <div className={styles.headerLeft}>
                  <MessageSquare size={20} className={styles.icon} />
                  <h2>{showTranslation ? 'Translation' : 'Transcript'}</h2>
                </div>
                
                {data.supportedLanguages && (
                  <div className={styles.toggleContainer}>
                    <button 
                      className={`${styles.toggleBtn} ${!showTranslation ? styles.toggleActive : ''}`}
                      onClick={() => setShowTranslation(false)}
                    >
                      Original
                    </button>
                    <div className={styles.translateGroup}>
                      <button 
                        className={`${styles.toggleBtn} ${showTranslation ? styles.toggleActive : ''}`}
                        onClick={() => {
                          setShowTranslation(true);
                          handleLanguageChange(selectedLang);
                        }}
                      >
                        <Globe size={14} />
                        Translated
                      </button>
                      
                      {showTranslation && (
                        <div className={styles.langSelectorWrapper}>
                          <select 
                            className={styles.langSelect}
                            value={selectedLang}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            disabled={isTranslating}
                          >
                            {Object.entries(data.supportedLanguages).map(([code, name]) => (
                               <option key={code} value={code}>{name as string}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className={styles.selectIcon} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div id="transcript-box" className={`${styles.transcriptBox} ${isTranslating ? styles.translating : ''}`}>
                {isTranslating ? (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <p>Translating to {data.supportedLanguages[selectedLang]}...</p>
                  </div>
                ) : (
                  <p>{showTranslation ? (translations[selectedLang] || "No translation available") : result.fullTranscript}</p>
                )}
              </div>
            </m.section>
          </div>

          <div className={styles.footerAction}>
            <button className={styles.chatActionBtn} onClick={() => setIsChatOpen(true)}>
              <div className={styles.sparkleOverlay} />
              <MessageSquare size={18} />
              <span>Chat with my Reel</span>
            </button>
          </div>
        </main>

        <ChatPanel 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          analysisTitle={result.title}
          analysisData={data}
        />
      </div>
    </AuroraBackground>
  );
};

export default AnalysisClient;
