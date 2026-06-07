/**
 * 数字工具函数
 * 提供数字格式化、计算、精度处理等常用操作
 */

/**
 * 格式化货币金额
 * @param amount 金额
 * @param currency 货币符号，默认人民币
 * @param decimals 小数位数
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
  amount: number,
  currency: string = '¥',
  decimals: number = 2
): string {
  if (isNaN(amount)) return `${currency}0.00`;
  const formatted = amount.toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency}${parts.join('.')}`;
}

/**
 * 格式化百分比
 * @param value 数值（0-1表示0%-100%）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化数字，添加千分位分隔符
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, decimals: number = 0): string {
  if (isNaN(num)) return '0';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 四舍五入到指定小数位
 * @param num 数字
 * @param decimals 小数位数
 * @returns 四舍五入后的数字
 */
export function round(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * 向上取整到指定小数位
 * @param num 数字
 * @param decimals 小数位数
 * @returns 向上取整后的数字
 */
export function ceil(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(num * factor) / factor;
}

/**
 * 向下取整到指定小数位
 * @param num 数字
 * @param decimals 小数位数
 * @returns 向下取整后的数字
 */
export function floor(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(num * factor) / factor;
}

/**
 * 限制数字在指定范围内
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制范围内的数字
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * 计算两个数的百分比
 * @param part 部分值
 * @param total 总值
 * @param decimals 小数位数
 * @returns 百分比值（0-100）
 */
export function calculatePercentage(
  part: number,
  total: number,
  decimals: number = 2
): number {
  if (total === 0) return 0;
  return round((part / total) * 100, decimals);
}

/**
 * 计算增长率
 * @param current 当前值
 * @param previous 上一期值
 * @param decimals 小数位数
 * @returns 增长率百分比
 */
export function calculateGrowthRate(
  current: number,
  previous: number,
  decimals: number = 2
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return round(((current - previous) / previous) * 100, decimals);
}

/**
 * 生成指定范围内的随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机浮点数
 * @param min 最小值
 * @param max 最大值
 * @param decimals 小数位数
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return round(value, decimals);
}

/**
 * 数字精度修复，解决浮点数计算精度问题
 * @param num 数字
 * @param precision 精度（小数位数）
 * @returns 修复精度后的数字
 */
export function fixPrecision(num: number, precision: number = 10): number {
  return parseFloat(num.toPrecision(precision));
}

/**
 * 安全的加法运算
 * @param a 数字a
 * @param b 数字b
 * @returns 运算结果
 */
export function safeAdd(a: number, b: number): number {
  const maxLen = Math.max(
    String(a).split('.')[1]?.length || 0,
    String(b).split('.')[1]?.length || 0
  );
  const factor = Math.pow(10, maxLen);
  return (Math.round(a * factor) + Math.round(b * factor)) / factor;
}

/**
 * 安全的减法运算
 * @param a 数字a
 * @param b 数字b
 * @returns 运算结果
 */
export function safeSubtract(a: number, b: number): number {
  const maxLen = Math.max(
    String(a).split('.')[1]?.length || 0,
    String(b).split('.')[1]?.length || 0
  );
  const factor = Math.pow(10, maxLen);
  return (Math.round(a * factor) - Math.round(b * factor)) / factor;
}

/**
 * 安全的乘法运算
 * @param a 数字a
 * @param b 数字b
 * @returns 运算结果
 */
export function safeMultiply(a: number, b: number): number {
  const lenA = String(a).split('.')[1]?.length || 0;
  const lenB = String(b).split('.')[1]?.length || 0;
  const factor = Math.pow(10, lenA + lenB);
  return (
    (Math.round(a * Math.pow(10, lenA)) * Math.round(b * Math.pow(10, lenB))) /
    factor
  );
}

/**
 * 安全的除法运算
 * @param a 被除数
 * @param b 除数
 * @param decimals 小数位数
 * @returns 运算结果
 */
export function safeDivide(a: number, b: number, decimals: number = 10): number {
  if (b === 0) return 0;
  return round(a / b, decimals);
}

/**
 * 计算数组总和
 * @param arr 数字数组
 * @returns 总和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => safeAdd(acc, val), 0);
}

/**
 * 计算数组平均值
 * @param arr 数字数组
 * @returns 平均值
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return safeDivide(sum(arr), arr.length);
}

/**
 * 获取数组最大值
 * @param arr 数字数组
 * @returns 最大值
 */
export function max(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.max(...arr);
}

/**
 * 获取数组最小值
 * @param arr 数字数组
 * @returns 最小值
 */
export function min(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.min(...arr);
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${round(bytes / Math.pow(k, i), decimals)} ${sizes[i]}`;
}

/**
 * 数字转中文大写金额
 * @param num 数字金额
 * @returns 中文大写金额字符串
 */
export function numberToChinese(num: number): string {
  if (num === 0) return '零元整';

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';

  if (integerPart > 0) {
    const intStr = String(integerPart);
    const len = intStr.length;
    let zeroFlag = false;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr[i]);
      const pos = len - 1 - i;
      const bigUnitPos = Math.floor(pos / 4);
      const unitPos = pos % 4;

      if (digit === 0) {
        zeroFlag = true;
        if (unitPos === 0 && bigUnitPos > 0) {
          let allZero = true;
          for (let j = i; j >= Math.max(0, i - 3); j--) {
            if (parseInt(intStr[j]) !== 0) {
              allZero = false;
              break;
            }
          }
          if (!allZero) {
            result += bigUnits[bigUnitPos];
          }
          zeroFlag = false;
        }
      } else {
        if (zeroFlag) {
          result += '零';
          zeroFlag = false;
        }
        result += digits[digit] + units[unitPos];
        if (unitPos === 0 && bigUnitPos > 0) {
          result += bigUnits[bigUnitPos];
        }
      }
    }
    result += '元';
  }

  if (decimalPart > 0) {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;
    if (jiao > 0) {
      result += digits[jiao] + '角';
    } else if (integerPart > 0) {
      result += '零';
    }
    if (fen > 0) {
      result += digits[fen] + '分';
    }
  } else {
    result += '整';
  }

  return result;
}
