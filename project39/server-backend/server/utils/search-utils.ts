import { z } from 'zod';

export const searchSchema = z.object({
  keyword: z.string()
    .max(100, '搜索关键词不能超过100个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9\s_-]*$/, '搜索关键词包含非法字符')
    .optional(),
  page: z.coerce.number()
    .int('页码必须是整数')
    .positive('页码必须是正整数')
    .default(1),
  pageSize: z.coerce.number()
    .int('每页数量必须是整数')
    .positive('每页数量必须是正整数')
    .max(100, '每页数量不能超过100')
    .default(10),
  status: z.enum(['published', 'draft', 'archived']).optional(),
  sortBy: z.enum(['createdAt', 'likeCount', 'viewCount', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchParams = z.infer<typeof searchSchema>;

export const SQL_SPECIAL_CHARS = ['%', '_', '[', ']', '^'];

export const escapeSqlLikePattern = (pattern: string): string => {
  let escaped = pattern;
  for (const char of SQL_SPECIAL_CHARS) {
    escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
  }
  return escaped;
};

export const sanitizeSearchKeyword = (keyword: string): string => {
  const trimmed = keyword.trim();
  
  if (trimmed.length === 0) {
    return '';
  }
  
  const withoutSpecialChars = trimmed.replace(/[;'"\-\\]/g, ' ');
  
  const singleSpaces = withoutSpecialChars.replace(/\s+/g, ' ');
  
  return singleSpaces.trim();
};

export const buildSearchPattern = (keyword: string): string => {
  const sanitized = sanitizeSearchKeyword(keyword);
  if (!sanitized) return '';
  
  const escaped = escapeSqlLikePattern(sanitized);
  
  return `%${escaped}%`;
};

export const SQL_INJECTION_PATTERNS = [
  /'.*--/,
  /'.*;/,
  /'.*OR.*'/,
  /'.*AND.*'/,
  /UNION.*SELECT/i,
  /INSERT.*INTO/i,
  /DELETE.*FROM/i,
  /UPDATE.*SET/i,
  /DROP.*TABLE/i,
  /CREATE.*TABLE/i,
  /ALTER.*TABLE/i,
  /EXEC.*xp_/i,
  /sp_executesql/i,
  /WAITFOR.*DELAY/i,
];

export const detectSqlInjectionAttempt = (input: string): boolean => {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
};

export const logSecurityEvent = (
  eventType: string,
  details: Record<string, unknown>,
  ip?: string
): void => {
  const timestamp = new Date().toISOString();
  const logMessage = JSON.stringify({
    timestamp,
    eventType,
    ip: ip || 'unknown',
    details,
  });
  
  console.warn(`[SECURITY] ${logMessage}`);
};
