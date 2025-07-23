// Privacy-conscious analytics utility
// Only tracks essential metrics without personal data

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
}

class Analytics {
  private config: AnalyticsConfig;
  private sessionId: string;
  private events: AnalyticsEvent[] = [];

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: typeof window !== 'undefined' && !window.location.hostname.includes('localhost'),
      debug: false,
      ...config
    };

    // Generate anonymous session ID
    this.sessionId = this.generateSessionId();

    if (this.config.debug) {
      console.log('Analytics initialized:', this.config);
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private isEnabled(): boolean {
    return this.config.enabled && typeof window !== 'undefined';
  }

  // Track page views
  trackPageView(page: string): void {
    if (!this.isEnabled()) return;

    this.track('page_view', {
      page,
      referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
      user_agent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  // Track user interactions
  trackInteraction(action: string, properties?: Record<string, string | number | boolean>): void {
    if (!this.isEnabled()) return;

    this.track('interaction', {
      action,
      ...properties
    });
  }

  // Track calculation events
  trackCalculation(type: 'quick' | 'full', properties?: Record<string, string | number | boolean>): void {
    if (!this.isEnabled()) return;

    this.track('calculation', {
      type,
      ...properties
    });
  }

  // Track export events
  trackExport(format: 'pdf' | 'csv' | 'json', success: boolean): void {
    if (!this.isEnabled()) return;

    this.track('export', {
      format,
      success
    });
  }

  // Track comparison usage
  trackComparison(action: 'add' | 'remove' | 'clear', packageCount?: number): void {
    if (!this.isEnabled()) return;

    const properties: Record<string, string | number | boolean> = { action };
    if (packageCount !== undefined) {
      properties.package_count = packageCount;
    }

    this.track('comparison', properties);
  }

  // Track errors (without sensitive data)
  trackError(error: string, context?: string): void {
    if (!this.isEnabled()) return;

    const properties: Record<string, string | number | boolean> = {
      error: error.substring(0, 200) // Truncated for privacy
    };
    if (context) {
      properties.context = context.substring(0, 100);
    }

    this.track('error', properties);
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    if (!this.isEnabled()) return;

    this.track('performance', {
      metric,
      value,
      unit
    });
  }

  // Generic track method
  private track(eventName: string, properties: Record<string, string | number | boolean> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        session_id: this.sessionId,
        timestamp: Date.now(),
        url: window.location.pathname,
        ...properties
      },
      timestamp: Date.now()
    };

    // Store event locally
    this.events.push(event);

    // Log in debug mode
    if (this.config.debug) {
      console.log('Analytics Event:', event);
    }

    // Send to endpoint if configured (batch sending for performance)
    if (this.config.endpoint) {
      this.sendEvent(event);
    }

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  // Send event to analytics endpoint
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.config.endpoint) return;

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        keepalive: true // Ensure event is sent even if page is closing
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to send analytics event:', error);
      }
    }
  }

  // Batch send all pending events
  async flush(): Promise<void> {
    if (!this.config.endpoint || this.events.length === 0) return;

    try {
      await fetch(this.config.endpoint + '/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.events),
        keepalive: true
      });

      this.events = [];
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to flush analytics events:', error);
      }
    }
  }

  // Get analytics summary (for debugging)
  getSummary(): { eventCount: number; sessionId: string; recentEvents: AnalyticsEvent[] } {
    return {
      eventCount: this.events.length,
      sessionId: this.sessionId,
      recentEvents: this.events.slice(-10)
    };
  }
}

// Create singleton instance
const analytics = new Analytics({
  debug: process.env.NODE_ENV === 'development',
  // endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT // Add when ready
});

// Auto-track page navigation
if (typeof window !== 'undefined') {
  // Track initial page load
  analytics.trackPageView(window.location.pathname);

  // Track navigation (for SPA)
  let lastUrl = window.location.pathname;
  new MutationObserver(() => {
    const currentUrl = window.location.pathname;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      analytics.trackPageView(currentUrl);
    }
  }).observe(document, { subtree: true, childList: true });

  // Track page unload (flush pending events)
  window.addEventListener('beforeunload', () => {
    analytics.flush();
  });

  // Track visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      analytics.flush();
    }
  });
}

export default analytics;

// Helper hooks for React components
export const useAnalytics = () => {
  return {
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackCalculation: analytics.trackCalculation.bind(analytics),
    trackExport: analytics.trackExport.bind(analytics),
    trackComparison: analytics.trackComparison.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics)
  };
}; 