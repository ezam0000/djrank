// Authentication middleware
const crypto = require("crypto");

// In-memory rate limiting (resets on server restart)
const rateLimitStore = new Map();

function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(ip) {
  cleanupRateLimits();

  const key = `auth_${ip}`;
  const now = Date.now();
  const data = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + 3600000, // 1 hour
  };

  if (now > data.resetAt) {
    data.count = 0;
    data.resetAt = now + 3600000;
  }

  if (data.count >= 5) {
    const minutesLeft = Math.ceil((data.resetAt - now) / 60000);
    throw new Error(
      `Too many failed attempts. Try again in ${minutesLeft} minutes.`
    );
  }

  return data;
}

function recordFailedAttempt(ip) {
  const data = checkRateLimit(ip);
  data.count++;
  rateLimitStore.set(`auth_${ip}`, data);
}

function resetRateLimit(ip) {
  rateLimitStore.delete(`auth_${ip}`);
}

function isAdmin(req) {
  const token = req.headers["x-admin-token"];
  const adminSecret = process.env.ADMIN_SECRET;

  if (!token || !adminSecret) {
    return false;
  }

  try {
    // Constant-time comparison to prevent timing attacks
    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(adminSecret);

    if (tokenBuffer.length !== secretBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, secretBuffer);
  } catch (error) {
    return false;
  }
}

function requireAdmin(req, res) {
  // Get client IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown";

  try {
    // Check rate limit first
    checkRateLimit(ip);

    // Check if admin
    if (!isAdmin(req)) {
      recordFailedAttempt(ip);
      return {
        authorized: false,
        error: { status: 403, message: "Unauthorized" },
      };
    }

    // Success - reset rate limit
    resetRateLimit(ip);
    return { authorized: true };
  } catch (error) {
    // Rate limit exceeded
    return {
      authorized: false,
      error: { status: 429, message: error.message },
    };
  }
}

module.exports = {
  isAdmin,
  requireAdmin,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
};
