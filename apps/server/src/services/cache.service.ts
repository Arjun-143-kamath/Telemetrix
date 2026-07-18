import NodeCache from 'node-cache';

// Standard TTL: 1 hour (3600 seconds)
// Long TTL: 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Wraps an async function with caching.
 * @param key Unique string identifier for this cache entry
 * @param fetcher Async function that returns the data
 * @param ttl Time-to-live in seconds (defaults to 1 hour)
 * @returns Cached data or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const data = await fetcher();
    
    // Only cache if data is valid (not null/undefined/empty array). 
    if (data !== null && data !== undefined) {
      // Don't cache empty arrays or fallback strings which usually indicate an API error
      if (Array.isArray(data) && data.length === 0) return data;
      if (typeof data === 'string' && data === 'Info not available') return data;
      
      cache.set(key, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error(`Error in cached fetcher for key ${key}:`, error);
    throw error;
  }
}

export default cache;
