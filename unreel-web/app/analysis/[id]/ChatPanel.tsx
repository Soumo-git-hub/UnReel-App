'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';
import { chatAboutVideo } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analysisTitle: string;
  analysisData: any;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, analysisTitle, analysisData }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: `Hi! I've fully analyzed "${analysisTitle}". I can help you summarize parts, find specific quotes, or explain concepts mentioned in the transcript. What's on your mind?` 
    }
  ]);
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
    
    try {
      const response = await chatAboutVideo(analysisData.analysisId, messageText);
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
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Conversation copied to clipboard as Markdown!');
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
                className={styles.iconBtn}
                title={isFullScreen ? "Minimize" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={handleExport} className={styles.iconBtn} title="Export Chat">
                <Send size={16} />
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
