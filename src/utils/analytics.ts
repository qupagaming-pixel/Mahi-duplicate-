// Google Analytics 4 Utility for Mahi AI
// Fully compatible with React, Vite, TypeScript, Vercel, and SSR.

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Access environment variables securely in Vite
const metaEnv = (import.meta as any).env || {};
const MEASUREMENT_ID = metaEnv.VITE_GA_MEASUREMENT_ID || '';
const isProduction = metaEnv.PROD || process.env.NODE_ENV === 'production';
const isSSR = typeof window === 'undefined';

/**
 * Initialize Google Analytics 4
 * Safely runs only in client-side production when a measurement ID is available.
 */
export function initGA() {
  if (isSSR) return;

  if (!MEASUREMENT_ID) {
    // In development or if missing, provide safe mock functions that log to console
    if (!isProduction) {
      console.log('[Analytics] Development Mode: Mocking Google Analytics 4. ID:', MEASUREMENT_ID || 'Not Configured');
    }
    setupMockGtag();
    return;
  }

  if (!isProduction) {
    console.log('[Analytics] Development Mode: Skipping real GA script injection. Event logger active.');
    setupMockGtag();
    return;
  }

  // Prevent double injection
  if (window.gtag) return;

  try {
    // 1. Inject gtag.js script
    const scriptId = 'google-analytics-gtag';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    // 2. Setup standard gtag dataLayer sequence
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      if (window.dataLayer) {
        window.dataLayer.push(arguments);
      }
    };

    window.gtag('js', new Date());
    
    // Disable automatic default page_views; we trigger page views manually and automatically in usePageTracking
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
      cookie_flags: 'SameSite=None;Secure'
    });

    console.log('[Analytics] GA4 initialized successfully with ID:', MEASUREMENT_ID);
  } catch (err) {
    console.error('[Analytics] Failed to initialize Google Analytics:', err);
    setupMockGtag();
  }
}

/**
 * Set up a mock window.gtag function to avoid reference crashes and log during development
 */
function setupMockGtag() {
  if (typeof window === 'undefined') return;
  if (window.gtag) return;

  window.gtag = function (action: string, eventName: string, eventParams?: any) {
    if (!isProduction) {
      console.log(`%c[Analytics Event]%c ${action} ➔ %c${eventName}`, 'color: #a855f7; font-weight: bold;', 'color: #cbd5e1;', 'color: #06b6d4; font-weight: bold;', eventParams || '');
    }
  };
}

/**
 * Track page views manually
 * @param path The path of the page (e.g. '/privacy')
 * @param title Optional page title
 */
export function trackPageView(path: string, title?: string) {
  if (isSSR) return;

  const resolvedPath = path.startsWith('/') ? path : `/${path}`;
  const resolvedTitle = title || document.title;

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: resolvedPath,
      page_title: resolvedTitle,
      page_location: window.location.href,
    });
  }
}

/**
 * Track a custom Google Analytics 4 event
 * @param eventName Name of the custom event (e.g. 'voice_chat_started')
 * @param params Optional custom key-value metadata parameters
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (isSSR) return;

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * A reusable React hook to automatically track page/view transitions.
 * This hook automatically listens to:
 * 1. Initial page load
 * 2. Back/Forward browser buttons (popstate events)
 * 3. SPA route updates (pushState/replaceState calls utilized by React Router, etc.)
 */
import { useEffect } from 'react';

export function usePageTracking() {
  useEffect(() => {
    if (isSSR) return;

    // Track the current page upon initial mounting of the app
    trackPageView(window.location.pathname, document.title);

    // Listen to standard history back/forward (popstate) actions
    const handleLocationChange = () => {
      trackPageView(window.location.pathname, document.title);
    };

    window.addEventListener('popstate', handleLocationChange);

    // Intercept History API pushes and replaces to capture SPA route changes (e.g. from React Router)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (state, unused, url) {
      originalPushState.apply(this, [state, unused, url]);
      // Wait briefly for title or virtual views to settle in the DOM
      setTimeout(() => {
        trackPageView(window.location.pathname, document.title);
      }, 100);
    };

    window.history.replaceState = function (state, unused, url) {
      originalReplaceState.apply(this, [state, unused, url]);
      setTimeout(() => {
        trackPageView(window.location.pathname, document.title);
      }, 100);
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);
}
