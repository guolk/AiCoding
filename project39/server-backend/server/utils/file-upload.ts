import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': {
    extensions: ['.jpg', '.jpeg'],
    magicNumbers: [
      [0xff, 0xd8, 0xff],
    ],
  },
  'image/png': {
    extensions: ['.png'],
    magicNumbers: [
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    ],
  },
  'image/gif': {
    extensions: ['.gif'],
    magicNumbers: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
  },
  'image/webp': {
    extensions: ['.webp'],
    magicNumbers: [
      [0x52, 0x49, 0x46, 0x46],
    ],
  },
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_IMAGE_TYPES;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MIN_FILE_SIZE = 100;

export interface FileValidationResult {
  valid: boolean;
  mimeType?: AllowedMimeType;
  extension?: string;
  error?: string;
}

const bufferToHex = (buffer: Uint8Array): string => {
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
};

const matchesMagicNumber = (fileBuffer: Uint8Array, magicNumbers: number[][]): boolean => {
  return magicNumbers.some((magic) => {
    if (fileBuffer.length < magic.length) return false;
    for (let i = 0; i < magic.length; i++) {
      if (fileBuffer[i] !== magic[i]) return false;
    }
    return true;
  });
};

export const validateFileMagicNumber = async (
  filePath: string,
  mimeType: string
): Promise<boolean> => {
  const allowedType = ALLOWED_IMAGE_TYPES[mimeType as AllowedMimeType];
  if (!allowedType) return false;
  
  try {
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = new Uint8Array(12);
    await fileHandle.read(buffer, 0, 12, 0);
    await fileHandle.close();
    
    return matchesMagicNumber(buffer, allowedType.magicNumbers);
  } catch {
    return false;
  }
};

export const validateFileExtension = (filename: string, mimeType: string): boolean => {
  const allowedType = ALLOWED_IMAGE_TYPES[mimeType as AllowedMimeType];
  if (!allowedType) return false;
  
  const ext = path.extname(filename).toLowerCase();
  return allowedType.extensions.includes(ext);
};

export const validateMimeType = (mimeType: string): mimeType is AllowedMimeType => {
  return Object.prototype.hasOwnProperty.call(ALLOWED_IMAGE_TYPES, mimeType);
};

export const validateFileSize = (size: number): { valid: boolean; error?: string } => {
  if (size < MIN_FILE_SIZE) {
    return { valid: false, error: `文件太小，最小需要 ${MIN_FILE_SIZE} 字节` };
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `文件太大，最大允许 ${MAX_FILE_SIZE / (1024 * 1024)} MB` };
  }
  return { valid: true };
};

export const validateImageFile = async (
  filePath: string,
  filename: string,
  size: number,
  reportedMimeType: string
): Promise<FileValidationResult> => {
  const sizeValidation = validateFileSize(size);
  if (!sizeValidation.valid) {
    return { valid: false, error: sizeValidation.error };
  }
  
  if (!validateMimeType(reportedMimeType)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${reportedMimeType}。支持的类型: ${Object.keys(ALLOWED_IMAGE_TYPES).join(', ')}`,
    };
  }
  
  if (!validateFileExtension(filename, reportedMimeType)) {
    return {
      valid: false,
      error: `文件扩展名与MIME类型不匹配。MIME类型 ${reportedMimeType} 应使用扩展名: ${ALLOWED_IMAGE_TYPES[reportedMimeType as AllowedMimeType].extensions.join(', ')}`,
    };
  }
  
  const magicValid = await validateFileMagicNumber(filePath, reportedMimeType);
  if (!magicValid) {
    return {
      valid: false,
      error: '文件内容与声称的类型不匹配',
    };
  }
  
  const ext = path.extname(filename).toLowerCase();
  
  return {
    valid: true,
    mimeType: reportedMimeType as AllowedMimeType,
    extension: ext,
  };
};

export const generateSafeFilename = (
  originalName: string,
  extension: string
): string => {
  const safeName = originalName
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_')
    .substring(0, 50);
  
  return `${uuidv4()}_${safeName}${extension}`;
};

export const ensureUploadDirectory = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true, mode: 0o750 });
  }
};

export const DANGEROUS_EXTENSIONS = [
  '.php', '.php3', '.php4', '.php5', '.php7', '.phtml',
  '.asp', '.aspx', '.ashx', '.asmx',
  '.jsp', '.jspx', '.jsw',
  '.exe', '.bat', '.cmd', '.sh',
  '.cgi', '.pl', '.py',
  '.html', '.htm', '.svg',
];

export const isDangerousExtension = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return DANGEROUS_EXTENSIONS.includes(ext);
};
