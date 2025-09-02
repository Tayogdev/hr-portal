import { getSession, signOut } from 'next-auth/react';
import cacheManager from './cacheManager';
import logger from './logger';

interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    isRegistered: boolean;
  };
  expires: string;
}

class SessionManager {
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly SESSION_WARNING_THRESHOLD = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.initializeSessionMonitoring();
  }

  /**
   * Initialize session monitoring
   */
  private initializeSessionMonitoring() {
    if (typeof window !== 'undefined') {
      // Check session every 5 minutes
      this.sessionCheckInterval = setInterval(() => {
        this.checkSessionValidity();
      }, this.SESSION_CHECK_INTERVAL);

      // Listen for storage events (for multi-tab sync)
      window.addEventListener('storage', this.handleStorageEvent.bind(this));

      // Listen for visibility change (tab focus)
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

      // Listen for beforeunload (cleanup on page unload)
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
  }

  /**
   * Check if current session is valid
   */
  private async checkSessionValidity() {
    try {
      const session = await getSession();
      
      if (!session) {
        this.handleSessionExpired();
        return;
      }

      // Check if session is about to expire
      const expiresAt = new Date(session.expires).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < this.SESSION_WARNING_THRESHOLD) {
        this.handleSessionWarning(timeUntilExpiry);
      }
    } catch (error) {
      logger.error('Session check failed', error as Error, 'SessionManager');
      this.handleSessionExpired();
    }
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired() {
    logger.info('Session expired, clearing cache and redirecting to login', 'SessionManager');
    this.clearSessionData();
    signOut({ callbackUrl: '/login' });
  }

  /**
   * Handle session warning (about to expire)
   */
  private handleSessionWarning(timeUntilExpiry: number) {
    const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000));
    logger.warn(`Session will expire in ${minutesLeft} minutes`, 'SessionManager');
    
    // You can show a user notification here
    this.showSessionWarning(minutesLeft);
  }

  /**
   * Show session warning to user
   */
  private showSessionWarning(minutesLeft: number) {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm">
            Your session will expire in ${minutesLeft} minutes. 
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="underline ml-2">Dismiss</button>
          </p>
        </div>
      </div>
    `;

    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('[data-session-warning]');
    existingNotifications.forEach(notification => notification.remove());

    // Add new notification
    notification.setAttribute('data-session-warning', 'true');
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Handle storage events (for multi-tab sync)
   */
  private handleStorageEvent(event: StorageEvent) {
    if (event.key === 'session-expired') {
      this.handleSessionExpired();
    }
  }

  /**
   * Handle visibility change (tab focus)
   */
  private handleVisibilityChange() {
    if (!document.hidden) {
      // Tab became visible, check session
      this.checkSessionValidity();
    }
  }

  /**
   * Handle beforeunload (cleanup)
   */
  private handleBeforeUnload() {
    this.cleanup();
  }

  /**
   * Clear all session-related data
   */
  private clearSessionData() {
    // Clear all cache including user-specific cache
    cacheManager.clear();
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedPageId');
      localStorage.removeItem('cachedPages');
      localStorage.removeItem('cachedPagesTime');
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Notify other tabs
      localStorage.setItem('session-expired', Date.now().toString());
      setTimeout(() => localStorage.removeItem('session-expired'), 1000);
    }
  }

  /**
   * Get current session data
   */
  async getCurrentSession(): Promise<SessionData | null> {
    try {
      const session = await getSession();
      return session as SessionData | null;
    } catch (error) {
      logger.error('Failed to get session', error as Error, 'SessionManager');
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session?.user;
  }

  /**
   * Check if user is registered
   */
  async isRegistered(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session?.user?.isRegistered;
  }

  /**
   * Get user ID from session
   */
  async getUserId(): Promise<string | null> {
    const session = await this.getCurrentSession();
    return session?.user?.id || null;
  }

  /**
   * Refresh session manually
   */
  async refreshSession(): Promise<void> {
    try {
      await getSession();
    } catch (error) {
      logger.error('Failed to refresh session', error as Error, 'SessionManager');
      this.handleSessionExpired();
    }
  }

  /**
   * Logout user and clear all data
   */
  async logout(): Promise<void> {
    this.clearSessionData();
    await signOut({ callbackUrl: '/login' });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionManager.cleanup();
  });
}

export default sessionManager; 