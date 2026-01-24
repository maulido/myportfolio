type RateLimitOptions = {
    interval: number; // Interval in milliseconds (e.g., 60000ms for 1 minute)
    uniqueTokenPerInterval: number; // Max number of unique tokens (IPs) to track per interval
};

export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new Map<string, number[]>();

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();
                const timestamps = tokenCache.get(token) || [];

                // Filter out timestamps older than the interval
                const validTimestamps = timestamps.filter(
                    (timestamp) => now - timestamp < options.interval
                );

                if (validTimestamps.length >= limit) {
                    // Start cleaning up if cache gets too big
                    if (tokenCache.size > options.uniqueTokenPerInterval) {
                        tokenCache.clear();
                    }
                    return reject(new Error('Rate limit exceeded'));
                }

                validTimestamps.push(now);
                tokenCache.set(token, validTimestamps);

                // Optional: Clean up cache periodically or if size limit hit (handled above simply)
                resolve();
            }),
    };
}
