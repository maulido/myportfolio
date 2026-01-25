// Simple analytics tracking utility
// For production, integrate with Vercel Analytics, Plausible, or Google Analytics

export interface AnalyticsEvent {
    event: string;
    properties?: Record<string, unknown>;
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event, properties);
    }

    // Send to analytics API
    if (typeof window !== 'undefined') {
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() })
        }).catch(err => console.error('Analytics error:', err));
    }
}

// Predefined tracking functions
export const analytics = {
    pageView: (page: string) => {
        trackEvent('page_view', { page });
    },

    cvDownload: () => {
        trackEvent('cv_download');
    },

    contactSubmit: (data?: { name?: string; email?: string }) => {
        trackEvent('contact_submit', data);
    },

    projectView: (projectId: string, projectTitle: string) => {
        trackEvent('project_view', { projectId, projectTitle });
    },

    blogView: (postId: string, postTitle: string) => {
        trackEvent('blog_view', { postId, postTitle });
    },

    newsletterSubscribe: (email: string) => {
        trackEvent('newsletter_subscribe', { email });
    },

    socialShare: (platform: string, url: string) => {
        trackEvent('social_share', { platform, url });
    },

    skillEndorse: (skill: string) => {
        trackEvent('skill_endorse', { skill });
    },
};
