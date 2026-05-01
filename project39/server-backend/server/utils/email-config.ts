export const MAX_RETRY_COUNT = 5;

export const BASE_RETRY_DELAY_SECONDS = 60;

export const MAX_RETRY_DELAY_SECONDS = 24 * 60 * 60;

export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'dead';

export type EmailErrorType = 'temporary' | 'permanent' | 'unknown';

export interface EmailSendResult {
  success: boolean;
  errorType?: EmailErrorType;
  errorMessage?: string;
  shouldRetry?: boolean;
  retryDelay?: number;
}

export const TEMPORARY_ERROR_PATTERNS = [
  /timeout/i,
  /connection (refused|reset|timed out)/i,
  /service unavailable/i,
  /try again later/i,
  /too many connections/i,
  /rate limit/i,
  /throttled/i,
  /temporarily unavailable/i,
  /dns lookup failed/i,
  /socket (hang|timeout|error)/i,
  /421/i,
  /450/i,
  /451/i,
  /452/i,
];

export const PERMANENT_ERROR_PATTERNS = [
  /no such user/i,
  /user not found/i,
  /recipient (not found|rejected)/i,
  /invalid (recipient|email|address)/i,
  /mailbox (unavailable|disabled|full)/i,
  /550/i,
  /551/i,
  /552/i,
  /553/i,
  /554/i,
  /authentication (failed|required)/i,
  /relay access denied/i,
  /spam detected/i,
  /blocked/i,
  /blacklisted/i,
];

export const classifyError = (error: Error | string): EmailErrorType => {
  const message = typeof error === 'string' ? error : error.message;
  
  for (const pattern of PERMANENT_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return 'permanent';
    }
  }
  
  for (const pattern of TEMPORARY_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return 'temporary';
    }
  }
  
  return 'unknown';
};

export const calculateRetryDelay = (retryCount: number): number => {
  const delay = BASE_RETRY_DELAY_SECONDS * Math.pow(2, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY_SECONDS);
};

export const shouldRetry = (retryCount: number, errorType: EmailErrorType): boolean => {
  if (errorType === 'permanent') {
    return false;
  }
  
  return retryCount < MAX_RETRY_COUNT;
};

export const getNextRetryTime = (retryCount: number): Date => {
  const delaySeconds = calculateRetryDelay(retryCount);
  return new Date(Date.now() + delaySeconds * 1000);
};
