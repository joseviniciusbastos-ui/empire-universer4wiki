// Cache utilities for performance optimization

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const CacheManager = {
    // Posts cache
    getPosts: (): any[] | null => {
        const cached = localStorage.getItem('wiki_posts_cache');
        if (!cached) return null;

        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_DURATION) {
                localStorage.removeItem('wiki_posts_cache');
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    },

    setPosts: (posts: any[]) => {
        const cache = {
            data: posts,
            timestamp: Date.now()
        };
        localStorage.setItem('wiki_posts_cache', JSON.stringify(cache));
    },

    clearPosts: () => {
        localStorage.removeItem('wiki_posts_cache');
    },

    // Generic cache getter
    get: (key: string, duration: number = CACHE_DURATION): any | null => {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > duration) {
                localStorage.removeItem(key);
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    },

    // Generic cache setter
    set: (key: string, data: any) => {
        const cache = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cache));
    },

    // Clear all cache
    clearAll: () => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('wiki_') || key.startsWith('draft_'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            if (!key.startsWith('draft_')) { // Keep drafts
                localStorage.removeItem(key);
            }
        });
    }
};

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility (for scroll events, etc)
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
