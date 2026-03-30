import React from 'react';
import { History, Bookmark, Settings } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleHistory?: () => void;
  onToggleSettings?: () => void;
  hideHistory?: boolean;
  hideSettings?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleHistory, onToggleSettings, hideHistory, hideSettings }) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftIcons}>
        {!hideHistory && (
          <button 
            className={styles.iconButton} 
            aria-label="History" 
            onClick={onToggleHistory}
          >
            <History size={24} />
          </button>
        )}
      </div>

      <div className={styles.centerLogo} onClick={() => window.location.href = '/'}>
        <img src="/UnReel-Logo-BW.png" alt="" className={styles.logo} />
        <span className={styles.logoText}>UnReel</span>
      </div>

      <div className={styles.rightIcons}>
        {!hideSettings && (
          <button 
            className={styles.iconButton} 
            aria-label="Settings" 
            onClick={onToggleSettings}
          >
            <Settings size={24} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
