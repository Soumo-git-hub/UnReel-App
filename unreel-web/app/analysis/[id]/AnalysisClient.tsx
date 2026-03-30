'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { m } from 'framer-motion';
import { 
  ArrowLeft, Share2, Globe, Music, MapPin, Key, 
  ShoppingBag, CheckCircle, Lightbulb, FileText, 
  Download, BookOpen, Link as LinkIcon, MessageSquare, Sparkles, ChevronDown, ExternalLink, GraduationCap, Search 
} from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';
import Header from '@/components/Header';
import ChatPanel from './ChatPanel';
import styles from './AnalysisPage.module.css';
import { translateTranscript, getAnalysis, listHistory } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import dynamic from 'next/dynamic';
import ProcessScreen from '@/components/ProcessScreen';
import jsPDF from 'jspdf';

const AuthModal = dynamic(() => import('@/components/Auth/AuthModal'), { ssr: false });
const HistoryPanel = dynamic(() => import('@/components/HistoryPanel'), { ssr: false });
const SettingsPanel = dynamic(() => import('@/components/SettingsPanel'), { ssr: false });

// Local brand-specific icons to avoid Lucide version issues
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const DriveIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
    <path d="M7 13l5-5 5 5"/>
    <path d="M12 8v12"/>
  </svg>
);

const AnalysisClient = () => {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showChatGlow, setShowChatGlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowChatGlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return; // Wait for Firebase to initialize

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
          const result = await getAnalysis(params.id as string, user);
          setData(result);
        } catch (err) {
          console.error("Failed to fetch analysis:", err);
          router.push('/');
        }
      }
    };

    fetchData();
  }, [params.id, router, loading, user]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [selectedLang, setSelectedLang] = useState<string>('hi');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleToggleHistory = async () => {
    if (!showHistory) {
      setShowHistory(true);
      setShowSettings(false);
      
      if (user) {
        try {
          setHistoryLoading(true);
          const data = await listHistory(user);
          setHistoryData(data);
        } catch (err) {
          console.error('History refresh failed:', err);
        } finally {
          setHistoryLoading(false);
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
    location: data.content?.locationContext,
    educational: data.content?.educationalInsights,
    shopping: data.content?.shoppingItems,
    factCheck: data.content?.factCheck,
    enhancedResources: data.content?.enhancedResources,
    // Hybrid mapping for music to handle root vs nested vs variations
    music: (() => {
      const musicSource = data.musicContext || data.content?.musicContext || data.content?.music_context || data.content?.musicInfo;
      if (!musicSource || Object.keys(musicSource).length === 0) return null;
      
      const songName = musicSource.songName || musicSource.song_name || musicSource.title || musicSource.name;
      const artist = musicSource.artist || musicSource.creator;
      const musicLink = musicSource.musicLink || musicSource.music_link || musicSource.url;
      
      return songName ? { songName, artist: artist || "Unknown Artist", musicLink } : null;
    })(),
    features: data.availableFeatures || {}
  };

  const handleExportReport = () => {
    try {
      const doc = new jsPDF();
      
      const drawCard = (x: number, y: number, w: number, h: number, title: string, color: [number, number, number]) => {
        // Shadow/Border
        doc.setDrawColor(240);
        doc.roundedRect(x, y, w, h, 3, 3, 'S');
        // Header fill
        doc.setFillColor(color[0], color[1], color[2], 0.05); // Use 0.05 alpha if possible, otherwise use light RGB
        doc.roundedRect(x, y, w, 10, 3, 3, 'F');
        // Header Text
        doc.setFontSize(10);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", "bold");
        doc.text(title, x + 5, y + 7);
        return y + 15;
      };

      // Header
      doc.setFontSize(26);
      doc.setTextColor(16, 16, 28);
      doc.setFont("helvetica", "bold");
      doc.text("UnReel Intelligence Report", 20, 25);
      
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated by UnReel AI • ${new Date().toLocaleDateString()}`, 20, 32);
      
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({opacity: 0.1}));
      doc.setFillColor(6, 182, 212);
      doc.circle(180, 20, 40, 'F');
      doc.restoreGraphicsState();

      let yPos = 50;

      // Summary Card
      const summaryY = drawCard(20, yPos, 170, 40, "EXECUTIVE SUMMARY", [6, 182, 212]);
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(result.summary, 160);
      doc.text(summaryLines, 25, summaryY);
      yPos += 50;

      // 2-Column Row (Educational & Resources)
      const colW = 82;
      const rowY = yPos;
      
      // Educational
      let eduH = 10 + (result.educational?.length * 8 || 0);
      drawCard(20, rowY, colW, Math.max(eduH, 40), "EDUCATIONAL", [139, 92, 246]);
      doc.setFontSize(8);
      doc.setTextColor(80);
      result.educational?.slice(0, 4).forEach((item: string, i: number) => {
         const lines = doc.splitTextToSize(`• ${item}`, colW - 10);
         doc.text(lines, 25, rowY + 18 + (i * 10));
      });

      // Resources (Synced with Web UI categories)
      const resourcesToUse = result.enhancedResources || result.mentionedResources || [];
      if (resourcesToUse.length > 0) {
        drawCard(20 + colW + 6, rowY, colW, Math.max(eduH, 40), "RESOURCES", [16, 185, 129]);
        resourcesToUse.slice(0, 4).forEach((res: any, i: number) => {
          doc.setFontSize(8);
          doc.setTextColor(16, 16, 28);
          doc.setFont("helvetica", "bold");
          const resName = res.name || res.title || "External Resource";
          doc.text(resName, 20 + colW + 11, rowY + 18 + (i * 10));
          
          const resWidth = doc.getTextWidth(resName); // Measure while at size 8
          
          if (res.url || res.resolvedUrl) {
            doc.setFontSize(7);
            doc.setTextColor(6, 182, 212);
            doc.textWithLink("[Link]", 20 + colW + 11 + resWidth + 2, rowY + 18 + (i * 10), { url: res.url || res.resolvedUrl });
          }
          
          doc.setFontSize(6);
          doc.setTextColor(150);
          doc.setFont("helvetica", "normal");
          doc.text((res.category || res.type || "Resource").toUpperCase(), 20 + colW + 11, rowY + 18 + (i * 10) + 4);
        });
      }

      yPos += Math.max(eduH, 40) + 10;

      // Analysis Context Card (NEW)
      if (result.keyTopics?.length > 0 || result.music) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        const contextH = result.music ? 35 : 25;
        const contextY = drawCard(20, yPos, 170, contextH, "ANALYSIS CONTEXT", [99, 102, 241]);
        
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        
        if (result.music) {
           doc.setTextColor(139, 92, 246);
           doc.setFont("helvetica", "bold");
           doc.text(`Music: ${result.music.songName} - ${result.music.artist}`, 25, contextY);
           if (result.music.musicLink) {
             doc.setFontSize(7);
             doc.setTextColor(6, 182, 212);
             doc.textWithLink(" [Listen]", 25 + doc.getTextWidth(`Music: ${result.music.songName} - ${result.music.artist}`) + 2, contextY, { url: result.music.musicLink });
           }
           doc.setTextColor(100);
           doc.setFont("helvetica", "normal");
           doc.setFontSize(8);
        }

        const topicsText = result.keyTopics.join("  •  ");
        const topicLines = doc.splitTextToSize(topicsText, 160);
        doc.text(topicLines, 25, contextY + (result.music ? 10 : 0));
        yPos += contextH + 10;
      }

      // Shopping Card
      if (result.shopping?.length > 0) {
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        const shopH = 15 + (result.shopping.length * 12);
        const shopY = drawCard(20, yPos, 170, shopH, "IDENTIFIED PRODUCTS", [236, 72, 153]);
        result.shopping.forEach((item: any, i: number) => {
          doc.setFontSize(9);
          doc.setTextColor(16, 16, 28);
          doc.setFont("helvetica", "bold");
          doc.text(item.name, 25, shopY + (i * 12));
          
          const nameWidth = doc.getTextWidth(item.name); // Measure while at size 9
          
          if (item.resolvedUrl || item.url) {
            doc.setFontSize(7);
            doc.setTextColor(6, 182, 212);
            doc.textWithLink(" [Shop Now]", 25 + nameWidth + 2, shopY + (i * 12), { url: item.resolvedUrl || item.url });
          }
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.setFont("helvetica", "normal");
          const descClean = (item.description || "").replace(/[\r\n]+/g, " ");
          doc.text(descClean, 25, shopY + (i * 12) + 4);
        });
        yPos += shopH + 10;
      }

      // Fact Check
      if (result.factCheck?.length > 0) {
        if (yPos > 210) { doc.addPage(); yPos = 20; }
        const factH = 15 + (result.factCheck.length * 15);
        const factY = drawCard(20, yPos, 170, factH, "AI FACT CHECK", [245, 158, 11]);
        result.factCheck.forEach((item: any, i: number) => {
          doc.setFontSize(8);
          const verdict = item.verdict || "Fact Check";
          if (verdict.toLowerCase() === 'supported') {
            doc.setTextColor(16, 185, 129);
          } else {
            doc.setTextColor(245, 158, 11);
          }
          doc.text(`${verdict.toUpperCase()}: ${item.claim || "Claim Verification"}`, 25, factY + (i * 15));
          doc.setFontSize(7);
          doc.setTextColor(120);
          const evLines = doc.splitTextToSize(item.explanation || item.evidence || "", 150);
          doc.text(evLines, 25, factY + (i * 15) + 4);
        });
        yPos += factH + 10;
      }

      // Location (Refined to match Web UI)
      const locationText = result.location?.sceneType 
        ? `${result.location.sceneType}${result.location.landmark ? ` at ${result.location.landmark}` : ""}`
        : typeof result.location === 'string' ? result.location : "";

      if (locationText) {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        const locY = drawCard(20, yPos, 170, 20, "LOCATION CONTEXT", [99, 102, 241]);
        doc.setFontSize(9);
        doc.setTextColor(60);
        doc.text(locationText, 25, locY + 2);
        yPos += 30;
      }

      // Transcript (Improved for Unicode/Hindi support)
      const activeTranscript = showTranslation ? (translations[selectedLang] || "No translation available") : result.fullTranscript;
      const transcriptTitle = showTranslation ? `TRANSLATED TRANSCRIPT (${selectedLang.toUpperCase()})` : "FULL TRANSCRIPT";
      
      const isUnicode = /[^\u0000-\u007F]/.test(activeTranscript);

      if (yPos > 220) { doc.addPage(); yPos = 20; }
      
      doc.setFontSize(14);
      doc.setTextColor(16, 16, 28);
      doc.setFont("helvetica", "bold");
      doc.text(transcriptTitle, 20, yPos);
      yPos += 10;
      
      if (isUnicode) {
        // Render Unicode (Hindi/Arabic/etc.) as High-Density Image using Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const lines = doc.splitTextToSize(activeTranscript, 170);
          canvas.width = 1700; // High resolution
          canvas.height = lines.length * 60 + 100;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = 'normal 36px "Inter", "Segoe UI", sans-serif';
          ctx.fillStyle = '#64748b';
          
          lines.forEach((line: string, i: number) => {
             ctx.fillText(line, 50, 60 + (i * 50));
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const imgWidth = 170;
          const imgHeight = (canvas.height / canvas.width) * imgWidth;
          
          // Check for page overflow
          if (yPos + imgHeight > 280) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.addImage(imgData, 'JPEG', 20, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        }
      } else {
        // Standard Latin-script rendering
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(activeTranscript, 170);
        lines.forEach((line: string) => {
          if (yPos > 280) { doc.addPage(); yPos = 20; }
          doc.text(line, 20, yPos);
          yPos += 5;
        });
      }

      doc.save(`${result.title.replace(/\s+/g, '_')}_Intelligence_Report.pdf`);
    } catch (err) {
      console.error("Report Export failed:", err);
      alert("Failed to generate premium report.");
    }
  };

  return (
    <AuroraBackground>
      <div className={styles.pageContainer}>
        <Header 
          onToggleHistory={handleToggleHistory} 
          onToggleSettings={handleToggleSettings} 
          hideHistory={true}
          hideSettings={true}
        />
        
        <main className={`${styles.main} ${isChatOpen ? styles.mainWithChat : ''}`}>
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.pageHeader}
          >
            <div className={styles.headerActions}>
              <button onClick={() => router.push('/')} className={styles.backBtn}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button 
                onClick={handleExportReport} 
                className={styles.actionBtn}
                title="Download Intelligence Report"
              >
                <Download size={18} />
                <span>Get Report</span>
              </button>
            </div>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>{result.title}</h1>
              <div className={styles.platformBadge}>
                {(() => {
                  const url = (data.originalUrl || data.metadata?.url || "").toLowerCase();
                  const platform = data.metadata?.platform?.toLowerCase() || "";
                  
                  if (url.includes('instagram.com') || url.includes('instagr.am') || platform === 'instagram') {
                    return (
                      <div className={`${styles.badge} ${styles.instaBadge}`}>
                        <InstagramIcon size={14} />
                        <span>Instagram Reel</span>
                      </div>
                    );
                  }
                  
                  if (url.includes('youtube.com') || url.includes('youtu.be') || platform === 'youtube') {
                    return (
                      <div className={`${styles.badge} ${styles.ytBadge}`}>
                        <YoutubeIcon size={14} />
                        <span>YouTube Clip</span>
                      </div>
                    );
                  }

                  if (url.includes('twitter.com') || url.includes('x.com') || platform === 'x' || platform === 'twitter') {
                    return (
                      <div className={`${styles.badge} ${styles.xBadge}`}>
                        <XIcon size={12} />
                        <span>X (Twitter)</span>
                      </div>
                    );
                  }

                  if (url.includes('linkedin.com') || platform === 'linkedin') {
                    return (
                      <div className={`${styles.badge} ${styles.linkedinBadge}`}>
                        <LinkedinIcon size={14} />
                        <span>LinkedIn Video</span>
                      </div>
                    );
                  }

                  if (url.includes('drive.google.com') || platform === 'gdrive' || platform === 'google_drive') {
                    return (
                      <div className={`${styles.badge} ${styles.driveBadge}`}>
                        <DriveIcon size={14} />
                        <span>Google Drive</span>
                      </div>
                    );
                  }

                  if (url.includes('tiktok.com') || platform === 'tiktok') {
                    return (
                      <div className={`${styles.badge} ${styles.tiktokBadge}`}>
                        <Globe size={14} />
                        <span>TikTok Video</span>
                      </div>
                    );
                  }

                  return (
                    <div className={`${styles.badge}`}>
                      <Globe size={14} />
                      <span>Video Content</span>
                    </div>
                  );
                })()}
              </div>
            </div>
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
                <h2>{result.features.enhancedResources ? 'Enhanced Links' : 'Resources'}</h2>
              </div>
              <div className={styles.resourceList}>
                {(result.enhancedResources || result.mentionedResources).length > 0 ? (
                  (result.enhancedResources || result.mentionedResources).map((res: any, i: number) => {
                    const name = res.name || String(res);
                    const url = res.resolvedUrl || res.urlSuggestion || `https://www.google.com/search?q=${encodeURIComponent(name)}`;
                    return (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.resourceCard}
                        title={res.analysisInsight || res.detectiveLogic}
                      >
                        <div className={styles.resInfo}>
                          <span className={styles.resName}>{name}</span>
                          {res.type && <span className={styles.resType}>{res.type}</span>}
                        </div>
                        <ExternalLink size={12} className={styles.resIcon} />
                      </a>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    <Search className={styles.emptyIcon} size={32} strokeWidth={1.5} />
                    <p className={styles.emptyTitle}>All Clear!</p>
                    <p className={styles.emptyDesc}>No external resources were detected in this analysis.</p>
                  </div>
                )}
              </div>
            </m.section>


            {result.music && (
              <m.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className={`${styles.compactCard} ${styles.musicCard}`}
              >
                <div className={styles.sectionHeader}>
                  <Music size={20} className={styles.icon} />
                  <h2>Music</h2>
                </div>
                <div className={styles.musicContent}>
                   <a 
                    href={result.music.musicLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.musicLinkWrapper}
                    title={`Listen to ${result.music.songName} by ${result.music.artist}`}
                  >
                    <div className={styles.musicIconWrapper}>
                      <Music size={24} />
                    </div>
                    <div className={styles.musicDetails}>
                      <span className={styles.fullSongName}>{result.music.songName}</span>
                      <span className={styles.fullArtistName}>{result.music.artist}</span>
                    </div>
                  </a>
                </div>
              </m.section>
            )}

            <m.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`${styles.compactCard} ${styles.topicsCard}`}
            >
              <div className={styles.sectionHeader}>
                <Key size={20} className={styles.icon} />
                <h2>Context</h2>
              </div>
              <div className={styles.contextContent}>
                <div className={styles.tagGrid}>
                  {result.keyTopics.map((topic: string, i: number) => (
                    <span key={i} className={styles.tag}>{topic}</span>
                  ))}
                </div>
              </div>
            </m.section>

            {result.features.location && result.location && (
              <m.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${styles.compactCard} ${styles.locationCard}`}
              >
                <div className={styles.sectionHeader}>
                  <MapPin size={20} className={styles.icon} />
                  <h2>Location</h2>
                </div>
                <div className={styles.contextItem}>
                  <span>{result.location.sceneType} {result.location.landmark && `at ${result.location.landmark}`}</span>
                </div>
              </m.section>
            )}

            {result.features.educational && result.educational && (
              <m.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.compactCard} ${styles.insightsCard}`}
              >
                <div className={styles.sectionHeader}>
                  <GraduationCap size={20} className={styles.icon} />
                  <h2>Educational Insights</h2>
                </div>
                <ul className={styles.insightsList}>
                  {result.educational.map((insight: string, i: number) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </m.section>
            )}

            {result.features.shopping && result.shopping && (
              <m.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.compactCard} ${styles.shoppingCard}`}
              >
                <div className={styles.sectionHeader}>
                  <ShoppingBag size={20} className={styles.icon} />
                  <h2>Shopping</h2>
                </div>
                <div className={styles.shoppingGrid}>
                  {result.shopping.length > 0 ? (
                    result.shopping.map((item: any, i: number) => (
                      <a key={i} href={item.resolvedUrl || `https://www.google.com/search?q=${encodeURIComponent(item.name)}`} target="_blank" rel="noopener noreferrer" className={styles.shopCard}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemDesc}>{item.description}</span>
                      </a>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <ShoppingBag className={styles.emptyIcon} size={32} strokeWidth={1.5} />
                      <p className={styles.emptyTitle}>Nothing to Shop</p>
                      <p className={styles.emptyDesc}>We didn't spot any specific products to buy in this reel.</p>
                    </div>
                  )}
                </div>
              </m.section>
            )}

            {result.features.factCheck && result.factCheck && (
              <m.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.compactCard} ${styles.factCard}`}
              >
                <div className={styles.sectionHeader}>
                  <CheckCircle size={20} className={styles.icon} />
                  <h2>Fact Check</h2>
                </div>
                <div className={styles.factList}>
                  {result.factCheck.length > 0 ? (
                    result.factCheck.map((check: any, i: number) => (
                      <div key={i} className={styles.factItem}>
                        <div className={styles.factStatus}>
                          <span className={`${styles.verdict} ${styles[check.verdict.toLowerCase()]}`}>{check.verdict}</span>
                          <span className={styles.claim}>{check.claim}</span>
                        </div>
                        <p className={styles.explanation}>{check.explanation}</p>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <CheckCircle className={styles.emptyIcon} size={32} strokeWidth={1.5} />
                      <p className={styles.emptyTitle}>Truth Verified</p>
                      <p className={styles.emptyDesc}>No claims required verification. Content appears stable.</p>
                    </div>
                  )}
                </div>
              </m.section>
            )}

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
            <button 
              className={`${styles.chatActionBtn} ${showChatGlow ? styles.breathingGlow : ''} ${(showHistory || showSettings || isChatOpen) ? styles.chatActionBtnHidden : ''}`} 
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
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

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={async () => {
             setShowAuthModal(false);
             handleToggleHistory();
          }} 
        />

        <HistoryPanel 
          isOpen={showHistory} 
          onToggle={handleToggleHistory}
          data={historyData} 
          isLoading={historyLoading} 
          isAnalysisPage={true}
          user={user}
          onLogin={() => { setShowAuthModal(true); setShowHistory(false); }}
          hideHandle={showAuthModal}
        />

        <SettingsPanel 
          isOpen={showSettings} 
          onToggle={handleToggleSettings} 
          isAnalysisPage={true}
          onLogin={() => { setShowAuthModal(true); setShowSettings(false); }}
          hideHandle={showAuthModal}
        />
      </div>
    </AuroraBackground>
  );
};

export default AnalysisClient;
