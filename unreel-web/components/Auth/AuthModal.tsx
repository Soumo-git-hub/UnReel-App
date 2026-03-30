'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/components/Auth/AuthModal.module.css';

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
  
  const getFriendlyError = (err: any) => {
    const message = err.message || '';
    if (message.includes('auth/invalid-credential') || 
        message.includes('auth/wrong-password') || 
        message.includes('auth/user-not-found')) {
      return "Hmm, those details don't match our records. Please try again.";
    }
    if (message.includes('auth/email-already-in-use')) {
      return "This email is already registered. Try signing in instead?";
    }
    if (message.includes('auth/weak-password')) {
      return "That password is a bit too easy. Try at least 6 characters.";
    }
    if (message.includes('auth/too-many-requests')) {
      return "Whoa, take a breather! Too many attempts. Try again in a bit.";
    }
    if (message.includes('auth/network-request-failed')) {
      return "Check your internet connection and let's try again.";
    }
    return message.replace('Firebase: ', '').replace(/Error \(auth\/.*\)\.?/, '').trim() || "Something went wrong. Let's try again.";
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      setError(getFriendlyError(err));
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
      setError(getFriendlyError(err));
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
            <div className={styles.modalContainer}>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>

              <div className={styles.splitLayout}>
                {/* Left Section - Branding & Visual */}
                <div className={styles.leftSection}>
                  <div className={styles.branding}>
                    <div className={styles.logoContainer}>
                      <img 
                        src="/UnReel-Logo-BW.png" 
                        alt="UnReel" 
                        className={styles.logoImg} 
                        fetchPriority="high"
                        decoding="async"
                      />
                    </div>
                    <h1 className={styles.brandName}>UnReel</h1>
                    <p className={styles.tagline}>
                      Watch the intelligence unfold.
                    </p>
                  </div>
                    <div className={styles.visualHook}>
                      <div className={styles.vectorArt}>
                        <img 
                          src="/UnReel-Auth.png" 
                          alt="" 
                          className={styles.bigVectorLogo} 
                          decoding="async"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <p className={styles.footerNote}>© 2026 UnReel</p>
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
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
