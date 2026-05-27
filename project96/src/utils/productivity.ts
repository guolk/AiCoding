
export const generatePassword = (
  length: number = 12,
  useUppercase: boolean = true,
  useLowercase: boolean = true,
  useNumbers: boolean = true,
  useSymbols: boolean = true
): string => {
  let charset = '';
  if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (charset === '') throw new Error('At least one character type must be selected');
  
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

export const unitConverters: Record<string, Record<string, number>> = {
  length: {
    'm': 1,
    'km': 1000,
    'cm': 0.01,
    'mm': 0.001,
    'mi': 1609.344,
    'yd': 0.9144,
    'ft': 0.3048,
    'in': 0.0254
  },
  weight: {
    'kg': 1,
    'g': 0.001,
    'mg': 0.000001,
    'lb': 0.453592,
    'oz': 0.0283495
  },
  temperature: {
    'c': 0,
    'f': 0,
    'k': 0
  }
};

export const convertLength = (value: number, from: string, to: string): number => {
  const meters = value * unitConverters.length[from];
  return meters / unitConverters.length[to];
};

export const convertWeight = (value: number, from: string, to: string): number => {
  const kg = value * unitConverters.weight[from];
  return kg / unitConverters.weight[to];
};

export const convertTemperature = (value: number, from: string, to: string): number => {
  let celsius: number;
  
  switch (from) {
    case 'c':
      celsius = value;
      break;
    case 'f':
      celsius = (value - 32) * 5 / 9;
      break;
    case 'k':
      celsius = value - 273.15;
      break;
    default:
      throw new Error('Invalid unit');
  }
  
  switch (to) {
    case 'c':
      return celsius;
    case 'f':
      return celsius * 9 / 5 + 32;
    case 'k':
      return celsius + 273.15;
    default:
      throw new Error('Invalid unit');
  }
};

