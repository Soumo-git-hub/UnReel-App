'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Maximize2, Minimize2, FileText } from 'lucide-react';
import { chatAboutVideo, getChatHistory } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analysisTitle: string;
  analysisData: any;
}

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

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, analysisTitle, analysisData }) => {
  const { user, loading } = useAuth();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const greeting = analysisData?.content?.keyTopics?.length > 0 
    ? `The context about ${analysisData.content.keyTopics.slice(0, 2).join(' and ')} is really interesting—what's on your mind?`
    : `What's on your mind about this video?`;

  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', text: greeting }
  ]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isOpen || !analysisData?.analysisId || loading) return;
      
      try {
        setIsLoadingHistory(true);
        const history = await getChatHistory(analysisData.analysisId, user);
        if (history.messages && history.messages.length > 0) {
          const formatted = history.messages.flatMap((m: any) => [
            { role: 'user', text: m.message },
            { role: 'bot', text: m.reply }
          ]);
          setMessages([{ role: 'bot', text: greeting }, ...formatted]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [isOpen, analysisData?.analysisId, loading, user]);

  const [input, setInput] = useState('');

  const suggestions = [
    "Summarize the key takeaways",
    "What are the main conclusion?",
    "Translate this section to Hindi",
    ...(analysisData?.content?.keyTopics?.slice(0, 1) || [])
  ];

  const handleSend = async (e?: React.FormEvent, text?: string) => {
    if (e) e.preventDefault();
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessages = [...messages, { role: 'user', text: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    
    // Build Persona string
    let personaStr = "";
    try {
      const savedPresets = localStorage.getItem('unreel_chat_persona');
      const customPrompt = localStorage.getItem('unreel_chat_custom');
      
      const parts = [];
      if (savedPresets) {
        const presets = JSON.parse(savedPresets);
        if (presets.length > 0) parts.push(`Traits: ${presets.join(', ')}`);
      }
      if (customPrompt) parts.push(`Custom Instructions: ${customPrompt}`);
      
      if (parts.length > 0) personaStr = parts.join(' | ');
    } catch(err) {}

    try {
      const response = await chatAboutVideo(analysisData.analysisId, messageText, user, personaStr);
      setIsTyping(false);
      setMessages([...newMessages, { role: 'bot', text: response.reply }]);
    } catch (err) {
      console.error("Chat failure:", err);
      setIsTyping(false);
      setMessages([...newMessages, { role: 'bot', text: "Sorry, I had trouble connecting to the AI. Please try again." }]);
    }
  };

  const renderMessage = (text: string) => {
    // Transform [00:45] into markdown links [ [00:45] ](timestamp:00:45) for custom rendering
    const processedText = text.replace(/(\[\d{2}:\d{2}\])/g, '[$1](timestamp:$1)');

    return (
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('timestamp:')) {
              const timestamp = href.split('timestamp:')[1].replace(/[\[\]]/g, '');
              return (
                <button 
                  className={styles.timestampLink} 
                  onClick={() => {
                    const box = document.getElementById('transcript-box');
                    box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    box?.classList.add(styles.highlight);
                    setTimeout(() => box?.classList.remove(styles.highlight), 2000);
                  }}
                >
                  {children}
                </button>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
          p: ({ children }) => <p className={styles.msgPara}>{children}</p>,
          ul: ({ children }) => <ul className={styles.msgList}>{children}</ul>,
          li: ({ children }) => <li className={styles.msgItem}>{children}</li>
        }}
      >
        {processedText}
      </ReactMarkdown>
    );
  };

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const meta = analysisData?.metadata || {};
      
      // Title Section
      doc.setFontSize(22);
      doc.setTextColor(16, 16, 28);
      doc.text("UnReel Chat Session", 20, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Video: ${analysisTitle}`, 20, 35);
      doc.text(`Exported: ${new Date().toLocaleString()}`, 20, 42);
      
      doc.setDrawColor(200);
      doc.line(20, 48, 190, 48);
      
      // Conversation
      let yOffset = 60;
      doc.setFontSize(10);
      
      messages.forEach((msg) => {
        const role = msg.role === 'user' ? 'You' : 'UnReel AI';
        doc.setFont("helvetica", "bold");
        doc.setTextColor(msg.role === 'user' ? 0 : 70);
        doc.text(`${role}:`, 20, yOffset);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        const splitText = doc.splitTextToSize(msg.text, 160);
        doc.text(splitText, 25, yOffset + 5);
        
        yOffset += (splitText.length * 6) + 12;
        
        // New Page logic
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
      });
      
      doc.save(`${analysisTitle.replace(/\s+/g, '_')}_chat.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      // Fallback
      const text = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
      navigator.clipboard.writeText(text);
      alert('PDF generation failed. Conversation copied to clipboard instead.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div 
          initial={{ x: '100%', opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            width: isFullScreen ? '100%' : '450px',
            maxWidth: isFullScreen ? '100%' : '450px'
          }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`${styles.panel} ${isFullScreen ? styles.fullScreen : ''}`}
        >
          <header className={styles.header}>
            <div className={styles.titleGroup}>
              <MessageSquare size={20} className={styles.botIcon} />
              <div>
                <h3>Chat with my Reel</h3>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)} 
                className={`${styles.iconBtn} ${styles.fullScreenBtn}`}
                title={isFullScreen ? "Minimize" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={handleExport} className={styles.iconBtn} title="Export as PDF">
                <FileText size={18} />
              </button>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
          </header>

          <div className={styles.chatArea}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.userMsg : styles.botMsg}`}>
                <div className={styles.bubble}>
                  {renderMessage(m.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.botMsg}`}>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.suggestions}>
              {suggestions.map((s: string, i: number) => (
                <button key={i} className={styles.suggestionBtn} onClick={() => handleSend(undefined, s)}>
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className={styles.inputArea}>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about specific moments..." 
                className={styles.input}
              />
              <button type="submit" className={styles.sendBtn}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;
