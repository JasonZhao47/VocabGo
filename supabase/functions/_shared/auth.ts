/**
 * Shared authentication utilities for edge functions
 * Provides graceful handling of missing or invalid auth headers
 */

export interface AuthResult {
  sessionId: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * Extract and validate session ID from request headers
 * Returns null for missing session ID instead of throwing
 */
export function getSessionId(req: Request): AuthResult {
  try {
    const sessionId = req.headers.get('x-session-id') || req.headers.get('X-Session-ID');
    
    if (!sessionId) {
      return {
        sessionId: null,
        isValid: false,
        error: 'Session ID required',
      };
    }

    // Basic validation: session ID should be a non-empty string
    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return {
        sessionId: null,
        isValid: false,
        error: 'Invalid session ID format',
      };
    }

    return {
      sessionId: sessionId.trim(),
      isValid: true,
    };
  } catch (error) {
    return {
      sessionId: null,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown auth error',
    };
  }
}

/**
 * Check if request is a health check or monitoring request
 * These requests should be handled gracefully without auth
 */
export function isHealthCheck(req: Request): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  const path = new URL(req.url).pathname;
  
  // Common health check patterns
  const healthCheckPatterns = [
    /health/i,
    /ping/i,
    /status/i,
    /monitor/i,
    /uptime/i,
  ];
  
  // Check if it's a health check based on path or user agent
  return healthCheckPatterns.some(pattern => 
    pattern.test(path) || pattern.test(userAgent)
  );
}

/**
 * Create a standardized unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Session ID required'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Create a standardized health check response
 */
export function createHealthCheckResponse(): Response {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
