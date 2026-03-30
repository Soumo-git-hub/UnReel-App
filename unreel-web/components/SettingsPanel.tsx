'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Settings, X, User, LogOut, Shield, Bell, Moon, Laptop, ChevronDown, Sparkles, Sun, Maximize, PlayCircle, GraduationCap, ShoppingBag, MapPin, CheckCircle, Music, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';

import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogin: () => void;
  isAnalysisPage?: boolean;
  hideHandle?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onToggle, onLogin, isAnalysisPage, hideHandle }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const [chatPresets, setChatPresets] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  React.useEffect(() => {
    setMounted(true);
  }, []);


  const [lenses, setLenses] = useState({
    educational: false,
    shopping: false,
    location: true,
    factCheck: false,
    resource: false,
    music: false
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('unreel_lenses');
    if (saved) {
      try {
        setLenses(JSON.parse(saved));
      } catch (e) {}
    }

    const savedPresets = localStorage.getItem('unreel_chat_persona');
    if (savedPresets) {
      try { setChatPresets(JSON.parse(savedPresets)); } catch (e) {}
    }
    const savedCustom = localStorage.getItem('unreel_chat_custom');
    if (savedCustom) setCustomPrompt(savedCustom);
  }, []);

  const toggleLens = (key: keyof typeof lenses) => {
    setLenses(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('unreel_lenses', JSON.stringify(next));
      return next;
    });
  };

  const togglePreset = (preset: string) => {
    setChatPresets(prev => {
      const next = prev.includes(preset) ? prev.filter(p => p !== preset) : [...prev, preset];
      localStorage.setItem('unreel_chat_persona', JSON.stringify(next));
      return next;
    });
  };

  const updateCustomPrompt = (val: string) => {
    setCustomPrompt(val);
    localStorage.setItem('unreel_chat_custom', val);
  };


  interface SettingItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    value?: string;
    renderExpanded?: () => React.ReactNode;
  }

  const settingsGroups: { title: string; icon: React.ReactNode; items: SettingItem[] }[] = [
    {
      title: 'Account',
      icon: <User size={18} />,
      items: [
        { 
          id: 'profile',
          label: 'Profile Settings', 
          icon: <User size={16} />,
          renderExpanded: () => (
            <div className={styles.expandedContent}>
              <div className={styles.inputGroup}>
                <label>Display Name</label>
                <input type="text" defaultValue={user?.displayName || ''} placeholder="Update name..." />
              </div>
              <button className={styles.saveBtn}>Update Profile</button>
            </div>
          )
        },
        { 
          id: 'personalization',
          label: 'Personalization', 
          icon: <Sparkles size={16} />,
          renderExpanded: () => (
            <div className={styles.expandedContent}>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <GraduationCap size={14} className={styles.rowIcon} />
                  <span>Educational</span>
                </div>
                <div 
                  className={lenses.educational ? styles.switchActive : styles.switch}
                  onClick={() => toggleLens('educational')}
                ><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <ShoppingBag size={14} className={styles.rowIcon} />
                  <span>Shopping</span>
                </div>
                <div 
                  className={lenses.shopping ? styles.switchActive : styles.switch}
                  onClick={() => toggleLens('shopping')}
                ><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <MapPin size={14} className={styles.rowIcon} />
                  <span>Location</span>
                </div>
                <div 
                  className={lenses.location ? styles.switchActive : styles.switch}
                  onClick={() => toggleLens('location')}
                ><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <CheckCircle size={14} className={styles.rowIcon} />
                  <span>Fact Check</span>
                </div>
                <div 
                  className={lenses.factCheck ? styles.switchActive : styles.switch}
                  onClick={() => toggleLens('factCheck')}
                ><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <Music size={14} className={styles.rowIcon} />
                  <span>Music Identifier</span>
                </div>
                <div 
                  className={lenses.music ? styles.switchActive : styles.switch}
                  onClick={() => toggleLens('music')}
                ><div className={styles.switchHandle} /></div>
              </div>
            </div>
          )
        },
        { 
          id: 'chat_persona',
          label: 'Chat Personality', 
          icon: <MessageSquare size={16} />,
          renderExpanded: () => {
             const availablePresets = ["Professional", "Gen-Z", "Content Creator", "Skeptic", "Concise", "Academic", "Marketer", "Humorous"];
             return (
              <div className={styles.expandedContent}>
                <p className={styles.hintText}>Select tags to guide the AI's tone and style.</p>
                <div className={styles.tagGrid}>
                  {availablePresets.map(preset => (
                    <button 
                      key={preset}
                      className={`${styles.tagBtn} ${chatPresets.includes(preset) ? styles.tagActive : ''}`}
                      onClick={() => togglePreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                  <label>Custom Instructions</label>
                  <textarea 
                    value={customPrompt} 
                    onChange={(e) => updateCustomPrompt(e.target.value)} 
                    placeholder="e.g. 'I'm a medical student, brutally fact-check claims.'"
                    rows={3}
                  />
                </div>
              </div>
            );
          }
        },
      ]
    },
    {
      title: 'Appearance',
      icon: <Moon size={18} />,
      items: [
        { 
          id: 'theme',
          label: 'Appearance', 
          icon: theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />, 
          value: mounted ? (theme === 'system' ? `System (${resolvedTheme})` : theme?.charAt(0).toUpperCase() + (theme?.slice(1) || '')) : 'Dark',
          renderExpanded: () => (
            <div className={styles.themeSelector}>
              <button 
                className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className={styles.themeIcon}><Sun size={20} /></div>
                <span>Light</span>
              </button>
              <button 
                className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className={styles.themeIcon}><Moon size={20} /></div>
                <span>Dark</span>
              </button>
              <button 
                className={`${styles.themeBtn} ${theme === 'system' ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme('system')}
              >
                <div className={styles.themeIcon}><Laptop size={20} /></div>
                <span>System</span>
              </button>
            </div>
          )
        },
      ]
    }
  ];

  return (
    <m.div 
      initial={false}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ 
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1]
      }}
      className={styles.panel}
    >
      {!hideHandle && (
        <m.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 255, 255, 0.9)',
            color: isOpen ? (resolvedTheme === 'dark' ? '#00ffff' : '#0D9488') : '#000'
          }}
          exit={{ opacity: 0, x: 20 }}
          className={`${styles.handle} ${isAnalysisPage ? styles.analysisHandle : ''}`} 
          onClick={onToggle}
          title="Settings"
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <m.div
            animate={{ rotate: isOpen ? -90 : 0 }}
            transition={{ duration: 0.1 }}
          >
            {isOpen ? <X size={22} /> : <Settings size={22} />}
          </m.div>
        </m.button>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <Settings size={20} className={styles.titleIcon} />
            <h2>Settings</h2>
          </div>
        </div>

        <div className={styles.scrollArea}>
          {user ? (
            <div className={styles.userSection}>
              <div className={styles.userAvatar}>
                {user.photoURL ? (
                  <Image src={user.photoURL} alt={user.displayName || 'User'} width={48} height={48} className={styles.avatarImage} />
                ) : (

                  <div className={styles.avatarPlaceholder}>
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.displayName || 'Anonymous User'}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>
          ) : (
            <div className={styles.authAction} style={{ marginBottom: '1.5rem', background: 'var(--card-bg)', borderRadius: '24px', padding: '2rem 1.5rem' }}>
              <div className={styles.avatarPlaceholder} style={{ width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--aurora-1)', color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.8rem' }}>
                <User size={30} />
              </div>
              <h3 style={{ fontSize: '1.4rem' }}>Setup your Profile</h3>
              <p style={{ fontSize: '0.9rem' }}>Sign in to save your chat tags, personalize your experience, and keep your history.</p>
              <button className={styles.authBtn} onClick={onLogin} style={{ padding: '1rem 2rem' }}>
                Login or Sign Up
              </button>
            </div>
          )}

          <div className={styles.settingsList}>
            {settingsGroups.filter(g => user || g.title !== 'Account').map((group, gIdx) => (
              <m.div 
                key={gIdx} 
                initial={{ x: 20, opacity: 0 }}
                animate={isOpen ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                transition={{ delay: 0.2 + (gIdx * 0.1) }}
                className={styles.group}
              >
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <div className={styles.groupItems}>
                  {group.items.map((item, iIdx) => {
                    const isExpanded = expandedItem === item.id;
                    return (
                      <div key={iIdx} className={`${styles.settingWrapper} ${isExpanded ? styles.activeWrapper : ''}`}>
                        <div 
                          className={styles.settingItem}
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                        >
                          <div className={styles.itemLeft}>
                            <span className={styles.itemIcon}>{item.icon}</span>
                            <span className={styles.itemLabel}>{item.label}</span>
                          </div>
                          <div className={styles.itemRight}>
                            {item.value && !isExpanded && <span className={styles.itemValue}>{item.value}</span>}
                            <ChevronDown 
                              size={16} 
                              className={styles.chevron}
                              style={{ 
                                transform: isExpanded ? 'rotate(180deg)' : 'none'
                              }} 
                            />
                          </div>
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && item.renderExpanded && (
                            <m.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                              className={styles.expansionZone}
                            >
                              <div className={styles.expansionInner}>
                                {item.renderExpanded()}
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </m.div>
            ))}
          </div>

          {user && (
            <button 
              className={styles.logoutBtn} 
              onClick={async () => {
                await logout();
                onToggle();
              }}
              type="button"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </m.div>
  );
};

export default SettingsPanel;
