
export const jsonFormat = (jsonStr: string): string => {
  try {
    const obj = JSON.parse(jsonStr);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    throw new Error('Invalid JSON format');
  }
};

export const base64Encode = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

export const base64Decode = (str: string): string => {
  return decodeURIComponent(atob(str).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
};

export const urlEncode = (str: string): string => {
  return encodeURIComponent(str);
};

export const urlDecode = (str: string): string => {
  return decodeURIComponent(str);
};

export const testRegex = (pattern: string, flags: string, testStr: string): boolean => {
  try {
    const regex = new RegExp(pattern, flags);
    return regex.test(testStr);
  } catch (e) {
    throw new Error('Invalid regular expression');
  }
};

export const getTextStats = (text: string) => {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  
  const charFrequency: Record<string, number> = {};
  for (const char of text) {
    charFrequency[char] = (charFrequency[char] || 0) + 1;
  }
  
  const sortedCharFrequency = Object.entries(charFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  return { chars, words, lines, charFrequency: sortedCharFrequency };
};

