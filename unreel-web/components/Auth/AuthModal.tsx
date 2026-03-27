'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './AuthModal.module.css';

import { User } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'main' | 'email-signin' | 'email-signup'>('main');
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user;
      if (view === 'email-signin') {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || `Failed to ${view}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <div className={styles.modalWrapper}>
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContainer}
            >
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>

              <div className={styles.splitLayout}>
                {/* Left Section - Branding & Visual */}
                <div className={styles.leftSection}>
                  <div className={styles.branding}>
                    <div className={styles.logoCircle}>
                      <span className={styles.logoLetter}>U</span>
                    </div>
                    <h1 className={styles.brandName}>UnReel</h1>
                    <p className={styles.tagline}>
                      The ultimate AI partner for content creators and curious minds.
                    </p>
                  </div>
                  <div className={styles.visualHook}>
                    <div className={styles.glowOrb} />
                    <div className={styles.floatingUI}>
                      <div className={styles.uiLine} style={{ width: '80%' }} />
                      <div className={styles.uiLine} style={{ width: '60%' }} />
                      <div className={styles.uiLine} style={{ width: '90%' }} />
                    </div>
                  </div>
                  <p className={styles.footerNote}>© 2026 UnReel AI Studio</p>
                </div>

                {/* Right Section - Auth Form */}
                <div className={styles.rightSection}>
                  <AnimatePresence mode="wait">
                    {view === 'main' && (
                      <m.div 
                        key="main"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={styles.authView}
                      >
                        <h2 className={styles.viewTitle}>Let's get started</h2>
                        <p className={styles.viewSubtitle}>
                          Create an account and explore tools to help you master reels.
                        </p>

                        <div className={styles.ssoGroup}>
                          <button className={styles.ssoBtn} onClick={handleGoogleLogin}>
                            <img src="https://www.google.com/favicon.ico" alt="Google" className={styles.ssoIcon} />
                            <span>Continue with Google</span>
                          </button>
                        </div>

                        <div className={styles.divider}>
                          <span>or</span>
                        </div>

                        <button 
                          className={styles.emailActionBtn}
                          onClick={() => setView('email-signup')}
                        >
                          Sign up with your email
                        </button>

                        <p className={styles.switchText}>
                          Already have an account? 
                          <button onClick={() => setView('email-signin')} className={styles.textLink}>Sign in</button>
                        </p>
                      </m.div>
                    )}

                    {(view === 'email-signin' || view === 'email-signup') && (
                      <m.div 
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={styles.authView}
                      >
                        <button className={styles.backBtn} onClick={() => setView('main')}>
                          <ArrowLeft size={16} />
                          <span>All sign up options</span>
                        </button>

                        <h2 className={styles.viewTitle}>
                          {view === 'email-signin' ? 'Welcome back' : 'Create your account'}
                        </h2>

                        {view === 'email-signin' && (
                          <>
                            <div className={styles.ssoGroup}>
                              <button className={styles.ssoBtn} onClick={handleGoogleLogin}>
                                <img src="https://www.google.com/favicon.ico" alt="Google" className={styles.ssoIcon} />
                                <span>Continue with Google</span>
                              </button>
                            </div>

                            <div className={styles.divider}>
                              <span>or</span>
                            </div>
                          </>
                        )}

                        <form className={styles.form} onSubmit={handleEmailAuth}>
                          {view === 'email-signup' && (
                            <div className={styles.field}>
                              <label>Full name *</label>
                              <input 
                                type="text" 
                                placeholder="Enter your first and last name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                              />
                            </div>
                          )}
                          <div className={styles.field}>
                            <label>Email *</label>
                            <input 
                              type="email" 
                              placeholder="Your email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className={styles.field}>
                            <div className={styles.labelRow}>
                              <label>Password *</label>
                              {view === 'email-signin' && (
                                <button type="button" className={styles.smallLink}>Forgot password?</button>
                              )}
                            </div>
                            <div className={styles.inputWrapper}>
                              <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder={view === 'email-signup' ? "Use strong password" : "Your password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                              />
                              <button 
                                type="button" 
                                className={styles.eyeBtn}
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          {view === 'email-signin' && (
                            <div className={styles.checkboxRow}>
                              <label className={styles.checkboxLabel}>
                                <input type="checkbox" className={styles.checkbox} />
                                <span>Remember me</span>
                              </label>
                            </div>
                          )}

                          {error && <p className={styles.errorText}>{error}</p>}

                          {view === 'email-signup' && (
                            <p className={styles.legalText}>
                              By clicking Create account, you agree to our 
                              <span className={styles.inlineLink}>Terms of Service</span>, 
                              <span className={styles.inlineLink}>Data Processing Terms</span>, and 
                              <span className={styles.inlineLink}>Cookie Policy</span>
                            </p>
                          )}

                          <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={loading}
                          >
                            {loading ? "Processing..." : (view === 'email-signin' ? "Sign in" : "Create account")}
                          </button>
                        </form>

                        <p className={styles.switchText}>
                          {view === 'email-signin' ? "Don't have an account? " : "Already have an account? "}
                          <button 
                            className={styles.textLink}
                            onClick={() => setView(view === 'email-signin' ? 'email-signup' : 'email-signin')}
                          >
                            {view === 'email-signin' ? 'Sign up' : 'Sign in'}
                          </button>
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
