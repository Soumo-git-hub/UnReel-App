'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Settings, X, User, LogOut, Shield, Bell, Moon, Laptop, ChevronDown, Sparkles, Sun, Maximize, PlayCircle, GraduationCap, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';

import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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
                <div className={styles.switchActive}><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <ShoppingBag size={14} className={styles.rowIcon} />
                  <span>Shopping</span>
                </div>
                <div className={styles.switchActive}><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <MapPin size={14} className={styles.rowIcon} />
                  <span>Location</span>
                </div>
                <div className={styles.switch}><div className={styles.switchHandle} /></div>
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.rowLabel}>
                  <CheckCircle size={14} className={styles.rowIcon} />
                  <span>Fact Check</span>
                </div>
                <div className={styles.switchActive}><div className={styles.switchHandle} /></div>
              </div>
            </div>
          )
        },
        { 
          id: 'privacy',
          label: 'Privacy & Security', 
          icon: <Shield size={16} />,
          renderExpanded: () => (
            <div className={styles.expandedContent}>
              <div className={styles.toggleRow}>
                <span>Two-Factor Auth</span>
                <div className={styles.switch}><div className={styles.switchHandle} /></div>
              </div>
              <p className={styles.hintText}>Protect your account with an extra layer of security.</p>
            </div>
          )
        },
        { 
          id: 'notifications',
          label: 'Notifications', 
          icon: <Bell size={16} />,
          renderExpanded: () => (
            <div className={styles.expandedContent}>
              <div className={styles.toggleRow}>
                <span>Email Alerts</span>
                <div className={styles.switchActive}><div className={styles.switchHandle} /></div>
              </div>
            </div>
          )
        },
      ]
    },
    {
      title: 'Appearance',
      icon: <Moon size={18} />,
      items: [
        { 
          id: 'theme',
          label: 'Dark Mode', 
          icon: <Moon size={16} />, 
          value: 'Dark',
          renderExpanded: () => (
            <div className={styles.themeSelector}>
              <button className={styles.themeBtn}>
                <div className={styles.themeIcon}><Sun size={20} style={{ opacity: 0.5 }} /></div>
                <span>Light</span>
              </button>
              <button className={`${styles.themeBtn} ${styles.themeBtnActive}`}>
                <div className={styles.themeIcon}><Moon size={20} /></div>
                <span>Dark</span>
              </button>
              <button className={styles.themeBtn}>
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
      animate={{ x: isOpen ? 0 : 390 }}
      transition={{ 
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1]
      }}
      className={styles.panel}
    >
      <m.button 
        className={styles.handle} 
        onClick={onToggle}
        title="Settings"
        animate={{ 
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 255, 255, 0.9)',
          color: isOpen ? '#00ffff' : '#000'
        }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        <m.div
          animate={{ rotate: isOpen ? -90 : 0 }}
          transition={{ duration: 0.1 }}
        >
          {isOpen ? <X size={22} /> : <Settings size={22} />}
        </m.div>
      </m.button>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <Settings size={20} className={styles.titleIcon} />
            <h2>Settings</h2>
          </div>
        </div>

        <div className={styles.scrollArea}>
          {user && (
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
          )}

          <div className={styles.settingsList}>
            {settingsGroups.map((group, gIdx) => (
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
