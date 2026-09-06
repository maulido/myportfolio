type RateLimitOptions = {
    interval: number; // Interval in milliseconds (e.g., 60000ms for 1 minute)
    uniqueTokenPerInterval: number; // Max number of unique tokens (IPs) to track per interval
};

export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new Map<string, number[]>();

    const pruneExpired = (now: number) => {
        for (const [key, timestamps] of tokenCache.entries()) {
            const valid = timestamps.filter((t) => now - t < options.interval);
            if (valid.length === 0) {
                tokenCache.delete(key);
            } else {
                tokenCache.set(key, valid);
            }
        }
    };

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();

                // Evict expired tokens if cache exceeds configured capacity
                if (tokenCache.size >= options.uniqueTokenPerInterval) {
                    pruneExpired(now);
                    // If still at or above capacity, drop the oldest entry
                    if (tokenCache.size >= options.uniqueTokenPerInterval) {
                        const oldestKey = tokenCache.keys().next().value;
                        if (oldestKey) tokenCache.delete(oldestKey);
                    }
                }

                const timestamps = tokenCache.get(token) || [];

                // Filter out timestamps older than the interval
                const validTimestamps = timestamps.filter(
                    (timestamp) => now - timestamp < options.interval
                );

                if (validTimestamps.length >= limit) {
                    return reject(new Error('Rate limit exceeded'));
                }

                validTimestamps.push(now);
                tokenCache.set(token, validTimestamps);

                resolve();
            }),
    };
}
