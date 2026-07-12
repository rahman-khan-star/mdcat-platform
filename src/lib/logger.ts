type LogLevel = "info" | "warn" | "error" | "security";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  details?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  ip?: string;
}

const sensitiveFields = [
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "otp",
  "secret",
  "apiKey",
  "card",
  "cvv",
  "privateKey",
];

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.event}`;
  const parts = [base];
  if (entry.requestId) parts.push(`req:${entry.requestId}`);
  if (entry.userId) parts.push(`user:${entry.userId}`);
  if (entry.ip) parts.push(`ip:${entry.ip}`);
  if (entry.details && Object.keys(entry.details).length > 0) {
    parts.push(JSON.stringify(redactSensitive(entry.details)));
  }
  return parts.join(" | ");
}

export const logger = {
  info(event: string, details?: Record<string, unknown>, meta?: { requestId?: string; userId?: string; ip?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      event,
      details,
      ...meta,
    };
    console.log(formatLog(entry));
  },

  warn(event: string, details?: Record<string, unknown>, meta?: { requestId?: string; userId?: string; ip?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "warn",
      event,
      details,
      ...meta,
    };
    console.warn(formatLog(entry));
  },

  error(event: string, details?: Record<string, unknown>, meta?: { requestId?: string; userId?: string; ip?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      event,
      details,
      ...meta,
    };
    console.error(formatLog(entry));
  },

  security(event: string, details?: Record<string, unknown>, meta?: { requestId?: string; userId?: string; ip?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "security",
      event,
      details,
      ...meta,
    };
    console.warn(formatLog(entry));
  },
};

// Convenience functions for common security events
export const securityLog = {
  failedLogin(email: string, ip: string, reason: string, requestId?: string) {
    logger.security("auth.login.failed", { email, reason }, { ip, requestId });
  },

  successfulLogin(userId: string, ip: string, requestId?: string) {
    logger.security("auth.login.success", {}, { userId, ip, requestId });
  },

  failedSignup(email: string, ip: string, reason: string, requestId?: string) {
    logger.security("auth.signup.failed", { email, reason }, { ip, requestId });
  },

  adminAction(userId: string, action: string, resource: string, resourceId?: string, ip?: string, requestId?: string) {
    logger.security("admin.action", { action, resource, resourceId }, { userId, ip, requestId });
  },

  unauthorizedAccess(path: string, ip: string, reason: string, requestId?: string) {
    logger.security("access.unauthorized", { path, reason }, { ip, requestId });
  },

  rateLimitHit(ip: string, path: string, requestId?: string) {
    logger.security("rate_limit.exceeded", { path }, { ip, requestId });
  },

  csrfViolation(ip: string, path: string, requestId?: string) {
    logger.security("csrf.violation", { path }, { ip, requestId });
  },

  fileUpload(userId: string, fileName: string, fileSize: number, requestId?: string) {
    logger.security("upload.complete", { fileName, fileSize }, { userId, requestId });
  },

  quizSubmitted(userId: string, quizId: string, score: number, requestId?: string) {
    logger.info("quiz.submitted", { quizId, score }, { userId, requestId });
  },
};
