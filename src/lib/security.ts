// Security monitoring and logging utility

export interface SecurityEvent {
  type: 'suspicious_activity' | 'authentication_failure' | 'rate_limit_exceeded' | 'input_validation_failure';
  message: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  context?: Record<string, any>;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(securityEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', securityEvent);
    }

    // In production, you would send this to a security monitoring service
    // Example: Sentry.captureMessage('Security Event', { level: 'warning', extra: securityEvent });
  }

  logSuspiciousActivity(message: string, context?: Record<string, any>) {
    this.logEvent({
      type: 'suspicious_activity',
      message,
      context
    });
  }

  logAuthenticationFailure(userId?: string, context?: Record<string, any>) {
    this.logEvent({
      type: 'authentication_failure',
      message: 'Authentication attempt failed',
      userId,
      context
    });
  }

  logRateLimitExceeded(ipAddress?: string, context?: Record<string, any>) {
    this.logEvent({
      type: 'rate_limit_exceeded',
      message: 'Rate limit exceeded',
      ipAddress,
      context
    });
  }

  logInputValidationFailure(input: string, context?: Record<string, any>) {
    this.logEvent({
      type: 'input_validation_failure',
      message: 'Input validation failed',
      context: { input, ...context }
    });
  }

  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const securityMonitor = new SecurityMonitor();

// Utility functions for common security checks
export function validateInput(input: string, pattern: RegExp, maxLength: number = 1000): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  if (input.length > maxLength) {
    securityMonitor.logInputValidationFailure(input, { reason: 'input_too_long', maxLength });
    return false;
  }

  if (!pattern.test(input)) {
    securityMonitor.logInputValidationFailure(input, { reason: 'pattern_mismatch', pattern: pattern.toString() });
    return false;
  }

  return true;
}

export function sanitizeUserInput(input: string): string {
  // Remove null bytes and other potentially dangerous characters
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function validateProfileSlug(slug: string): boolean {
  return validateInput(slug, /^[a-z0-9-]+$/, 50);
}

export function validateEmail(email: string): boolean {
  return validateInput(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 254);
} 