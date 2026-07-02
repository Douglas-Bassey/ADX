const buckets = new Map();

const cleanBucket = (bucket, now, windowMs) => {
  const recentTimestamps = bucket.timestamps.filter(
    (timestamp) => now - timestamp < windowMs,
  );

  bucket.timestamps = recentTimestamps;
  return bucket;
};

export const evaluateRateLimit = async (key, options = {}) => {
  const now = Date.now();
  const { limit = 10, windowMs = 60_000 } = options;

  const bucket = buckets.get(key) || { timestamps: [] };
  const activeBucket = cleanBucket(bucket, now, windowMs);
  const allowed = activeBucket.timestamps.length < limit;

  if (allowed) {
    activeBucket.timestamps.push(now);
  }

  buckets.set(key, activeBucket);

  const oldestTimestamp = activeBucket.timestamps[0] ?? now;
  const retryAfterMs = Math.max(windowMs - (now - oldestTimestamp), 0);

  return {
    allowed,
    remaining: Math.max(limit - activeBucket.timestamps.length, 0),
    limit,
    retryAfterMs,
  };
};

export default evaluateRateLimit;
