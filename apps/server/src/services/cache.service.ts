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
    // If it's an empty array, it might be a temporary API error, but valid if it's the beginning of the season. 
    // We cache it anyway, but you can add more strict checks if needed.
    if (data !== null && data !== undefined) {
      cache.set(key, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error(`Error in cached fetcher for key ${key}:`, error);
    throw error;
  }
}

export default cache;
