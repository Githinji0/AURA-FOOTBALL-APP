// In-memory cache for frequently accessed data
const cache = new Map();

const CACHE_TTL = {
  FIXTURES: 15 * 60 * 1000,      // 15 minutes
  STANDINGS: 6 * 60 * 60 * 1000, // 6 hours
  LIVE_MATCHES: 2 * 60 * 1000,   // 2 minutes
};

export const setCache = (key, data, ttl = CACHE_TTL.FIXTURES) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

export const getCache = (key) => {
  const cached = cache.get(key);

  if (!cached) return null;

  // Check if expired
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export const generateCacheKey = (prefix, leagueId, season) => {
  return `${prefix}:${leagueId}:${season}`;
};
