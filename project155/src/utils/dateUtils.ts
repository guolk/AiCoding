/**
 * 日期工具函数
 * 提供日期格式化、计算、比较等常用操作
 */

/**
 * 格式化日期为指定格式
 * @param date 日期对象或日期字符串
 * @param format 格式化模板，支持 YYYY-MM-DD HH:mm:ss 等格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 获取当前日期字符串
 * @param format 格式化模板
 * @returns 当前日期字符串
 */
export function getCurrentDate(format: string = 'YYYY-MM-DD'): string {
  return formatDate(new Date(), format);
}

/**
 * 获取当前时间戳
 * @returns 当前时间戳（毫秒）
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差（正数表示date2在date1之后）
 */
export function getDaysDiff(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const timeDiff = d2.getTime() - d1.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * 计算两个日期之间的月数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 月数差
 */
export function getMonthsDiff(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  let months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();

  return months;
}

/**
 * 判断日期是否在指定范围内
 * @param date 要判断的日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 是否在范围内
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const d = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const start = typeof startDate === 'string' ? new Date(startDate).getTime() : startDate.getTime();
  const end = typeof endDate === 'string' ? new Date(endDate).getTime() : endDate.getTime();

  return d >= start && d <= end;
}

/**
 * 给日期添加指定天数
 * @param date 原始日期
 * @param days 要添加的天数（负数表示减去）
 * @returns 新的日期
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 给日期添加指定月数
 * @param date 原始日期
 * @param months 要添加的月数（负数表示减去）
 * @returns 新的日期
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * 获取日期所在月份的第一天
 * @param date 日期
 * @returns 月份第一天
 */
export function getMonthStart(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * 获取日期所在月份的最后一天
 * @param date 日期
 * @returns 月份最后一天
 */
export function getMonthEnd(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * 获取星期几的中文名称
 * @param date 日期
 * @returns 星期几的中文名称
 */
export function getWeekdayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[d.getDay()];
}

/**
 * 比较两个日期
 * @param date1 日期1
 * @param date2 日期2
 * @returns -1: date1 < date2, 0: date1 == date2, 1: date1 > date2
 */
export function compareDates(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1).getTime() : date1.getTime();
  const d2 = typeof date2 === 'string' ? new Date(date2).getTime() : date2.getTime();

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * 计算工期进度百分比
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param currentDate 当前日期（可选，默认为今天）
 * @returns 进度百分比 0-100
 */
export function calculateProgress(
  startDate: Date | string,
  endDate: Date | string,
  currentDate?: Date | string
): number {
  const current = currentDate || new Date();
  const totalDays = getDaysDiff(startDate, endDate);
  const elapsedDays = getDaysDiff(startDate, current);

  if (totalDays <= 0) return 100;
  if (elapsedDays <= 0) return 0;
  if (elapsedDays >= totalDays) return 100;

  return Math.round((elapsedDays / totalDays) * 100);
}

/**
 * 格式化日期为相对时间（如：3天前，2个月后）
 * @param date 日期
 * @param baseDate 基准日期（可选，默认为今天）
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: Date | string, baseDate?: Date | string): string {
  const base = baseDate || new Date();
  const diffDays = getDaysDiff(base, date);

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === -1) return '昨天';
  if (diffDays > 0 && diffDays < 7) return `${diffDays}天后`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)}天前`;

  const diffMonths = getMonthsDiff(base, date);
  if (diffMonths === 0) return '本月';
  if (diffMonths === 1) return '下个月';
  if (diffMonths === -1) return '上个月';
  if (diffMonths > 0 && diffMonths < 12) return `${diffMonths}个月后`;
  if (diffMonths < 0 && diffMonths > -12) return `${Math.abs(diffMonths)}个月前`;

  const diffYears = Math.floor(diffMonths / 12);
  if (diffYears > 0) return `${diffYears}年后`;
  return `${Math.abs(diffYears)}年前`;
}
