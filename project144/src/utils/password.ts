import SHA1 from 'crypto-js/sha1';

const WEAK_PASSWORDS = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'iloveyou', 'sunshine', 'princess', 'football', 'secret', 'andrea'];

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

let lastPwnedRequestTime = 0;
const PWNED_RATE_LIMIT_MS = 1500;

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
}

export interface PwnedResult {
  isPwned: boolean;
  count: number;
}

export interface AccountPasswordHash {
  accountId: string;
  passwordHash: string;
}

function sha1(str: string): string {
  return SHA1(str).toString().toUpperCase();
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password || typeof password !== 'string') {
    return { strength: 'weak', score: 0, feedback: ['密码不能为空'] };
  }

  const lowerPassword = password.toLowerCase();
  if (WEAK_PASSWORDS.includes(lowerPassword)) {
    feedback.push('这是一个常见弱密码，请立即更换');
    return { strength: 'weak', score: 0, feedback };
  }

  const length = password.length;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);

  if (length < 8) {
    feedback.push('密码长度至少需要8个字符');
  } else {
    score += 1;
  }

  if (!hasLowercase) {
    feedback.push('建议添加小写字母');
  } else {
    score += 1;
  }

  if (!hasUppercase) {
    feedback.push('建议添加大写字母');
  } else {
    score += 1;
  }

  if (!hasDigit) {
    feedback.push('建议添加数字');
  } else {
    score += 1;
  }

  if (!hasSpecial) {
    feedback.push('建议添加特殊字符如 !@#$%^&*');
  } else {
    score += 1;
  }

  let strength: PasswordStrength;

  if (length < 8) {
    strength = 'weak';
    score = 0;
  } else if (length >= 12 && hasLowercase && hasUppercase && hasDigit && hasSpecial) {
    strength = 'strong';
  } else if (length >= 10 && hasLowercase && hasUppercase && hasDigit) {
    strength = 'good';
  } else if (length >= 8 && length <= 10 && !hasSpecial) {
    strength = 'fair';
  } else if (length >= 8) {
    strength = 'fair';
  } else {
    strength = 'weak';
  }

  if (feedback.length === 0) {
    feedback.push('密码强度很好！');
  }

  return { strength, score, feedback };
}

export function generateStrongPassword(length: number = 16): string {
  if (length < 4) {
    throw new Error('密码长度至少为4位，以确保包含所有字符类型');
  }

  const allChars = LOWERCASE + UPPERCASE + DIGITS + SPECIAL_CHARS;
  const password: string[] = [];

  password.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
  password.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
  password.push(DIGITS[Math.floor(Math.random() * DIGITS.length)]);
  password.push(SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)]);

  for (let i = 4; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

export function findDuplicatePasswords(accountPasswordHashes: AccountPasswordHash[]): string[][] {
  if (!Array.isArray(accountPasswordHashes)) {
    throw new Error('输入必须是数组');
  }

  const hashToAccounts = new Map<string, string[]>();

  for (const item of accountPasswordHashes) {
    if (!item || typeof item.accountId !== 'string' || typeof item.passwordHash !== 'string') {
      throw new Error('每个条目必须包含有效的 accountId 和 passwordHash 字符串');
    }

    const { accountId, passwordHash } = item;
    if (!hashToAccounts.has(passwordHash)) {
      hashToAccounts.set(passwordHash, []);
    }
    hashToAccounts.get(passwordHash)!.push(accountId);
  }

  const duplicates: string[][] = [];
  for (const accounts of hashToAccounts.values()) {
    if (accounts.length > 1) {
      duplicates.push(accounts);
    }
  }

  return duplicates;
}

export function isPasswordExpired(lastChangeDate: string, intervalDays: number): boolean {
  if (typeof lastChangeDate !== 'string') {
    throw new Error('lastChangeDate 必须是字符串');
  }
  if (typeof intervalDays !== 'number' || intervalDays < 0) {
    throw new Error('intervalDays 必须是非负数');
  }

  const lastChange = new Date(lastChangeDate);
  if (isNaN(lastChange.getTime())) {
    throw new Error('lastChangeDate 不是有效的日期格式');
  }

  const now = new Date();
  const diffTime = now.getTime() - lastChange.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays > intervalDays;
}

export function getDaysUntilExpiry(lastChangeDate: string, intervalDays: number): number {
  if (typeof lastChangeDate !== 'string') {
    throw new Error('lastChangeDate 必须是字符串');
  }
  if (typeof intervalDays !== 'number' || intervalDays < 0) {
    throw new Error('intervalDays 必须是非负数');
  }

  const lastChange = new Date(lastChangeDate);
  if (isNaN(lastChange.getTime())) {
    throw new Error('lastChangeDate 不是有效的日期格式');
  }

  const now = new Date();
  const expiryDate = new Date(lastChange);
  expiryDate.setDate(expiryDate.getDate() + intervalDays);

  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export async function checkPasswordPwned(password: string): Promise<PwnedResult> {
  if (!password || typeof password !== 'string') {
    throw new Error('密码不能为空且必须是字符串');
  }

  const hash = sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const now = Date.now();
  const timeSinceLastRequest = now - lastPwnedRequestTime;
  if (timeSinceLastRequest < PWNED_RATE_LIMIT_MS) {
    const waitTime = PWNED_RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastPwnedRequestTime = Date.now();

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`HIBP API 请求失败: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split('\n');

    let count = 0;
    for (const line of lines) {
      const [hashSuffix, hashCount] = line.trim().split(':');
      if (hashSuffix === suffix) {
        count = parseInt(hashCount, 10) || 0;
        break;
      }
    }

    return {
      isPwned: count > 0,
      count
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('检查密码泄露时发生未知错误');
  }
}
