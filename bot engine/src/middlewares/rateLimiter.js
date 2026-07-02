import { evaluateRateLimit } from "../config/ratelimit.js";

export const aiRateLimiter = async (req, res, next) => {
  try {
    const forwardedIp = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwardedIp) ? forwardedIp[0] : forwardedIp) ||
      req.ip ||
      req.socket?.remoteAddress ||
      "unknown";

    const { allowed, remaining, retryAfterMs } = await evaluateRateLimit(
      `ai:${ip}`,
      { limit: 10, windowMs: 60_000 },
    );

    if (!allowed) {
      res.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
      return res.status(429).json({
        success: false,
        message: "Too many AI requests. Please wait a moment and try again.",
        retryAfterMs,
      });
    }

    res.set("X-RateLimit-Limit", "10");
    res.set("X-RateLimit-Remaining", String(remaining));
    next();
  } catch (error) {
    next(error);
  }
};
