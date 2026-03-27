import React from 'react';
import { History, Bookmark, Settings } from 'lucide-react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.leftIcons}>
        <button className={styles.iconButton} aria-label="History">
          <History size={24} />
        </button>
        <button className={styles.iconButton} aria-label="Bookmarks">
          <Bookmark size={24} />
        </button>
      </div>
      <button className={styles.iconButton} aria-label="Settings">
        <Settings size={24} />
      </button>
    </header>
  );
};

export default Header;
