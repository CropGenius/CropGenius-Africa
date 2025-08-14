/**
 * 🚀 CROPGENIUS ANALYTICS - PRODUCTION READY
 * Lightweight analytics system for 100M farmers
 */

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp?: string;
}

class AnalyticsService {
    private isInitialized = false;
    private events: AnalyticsEvent[] = [];

    initialize() {
        if (this.isInitialized) return;

        this.isInitialized = true;

        if (import.meta.env.DEV) {
            console.log('🔥 [ANALYTICS] Initialized for development');
        }
    }

    track(eventName: string, properties?: Record<string, any>) {
        if (!this.isInitialized) return;

        const event: AnalyticsEvent = {
            name: eventName,
            properties,
            timestamp: new Date().toISOString()
        };

        this.events.push(event);

        // Keep only last 100 events to prevent memory leaks
        if (this.events.length > 100) {
            this.events = this.events.slice(-100);
        }

        if (import.meta.env.DEV) {
            console.log('📊 [ANALYTICS]', eventName, properties);
        }
    }

    getEvents() {
        return [...this.events];
    }

    clear() {
        this.events = [];
    }
}

const analytics = new AnalyticsService();

export const initAnalytics = () => {
    analytics.initialize();
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
};

export { analytics };