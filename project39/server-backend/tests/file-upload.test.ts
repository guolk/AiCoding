import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  validateImageFile,
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  isDangerousExtension,
  validateFileMagicNumber,
  generateSafeFilename,
  ensureUploadDirectory,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
  DANGEROUS_EXTENSIONS,
} from '../server/utils/file-upload';

describe('文件上传验证工具函数测试', () => {
  describe('validateMimeType', () => {
    it('应该允许支持的图片MIME类型', () => {
      expect(validateMimeType('image/jpeg')).toBe(true);
      expect(validateMimeType('image/png')).toBe(true);
      expect(validateMimeType('image/gif')).toBe(true);
      expect(validateMimeType('image/webp')).toBe(true);
    });

    it('应该拒绝不支持的MIME类型', () => {
      expect(validateMimeType('application/pdf')).toBe(false);
      expect(validateMimeType('text/html')).toBe(false);
      expect(validateMimeType('application/javascript')).toBe(false);
      expect(validateMimeType('application/octet-stream')).toBe(false);
    });
  });

  describe('validateFileExtension', () => {
    it('应该验证正确的文件扩展名', () => {
      expect(validateFileExtension('test.jpg', 'image/jpeg')).toBe(true);
      expect(validateFileExtension('test.jpeg', 'image/jpeg')).toBe(true);
      expect(validateFileExtension('test.png', 'image/png')).toBe(true);
      expect(validateFileExtension('test.gif', 'image/gif')).toBe(true);
      expect(validateFileExtension('test.webp', 'image/webp')).toBe(true);
    });

    it('应该拒绝扩展名与MIME类型不匹配的情况', () => {
      expect(validateFileExtension('test.png', 'image/jpeg')).toBe(false);
      expect(validateFileExtension('test.jpg', 'image/png')).toBe(false);
      expect(validateFileExtension('test.php', 'image/jpeg')).toBe(false);
      expect(validateFileExtension('test.asp', 'image/png')).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('应该接受合法的文件大小', () => {
      expect(validateFileSize(1024).valid).toBe(true);
      expect(validateFileSize(1024 * 1024).valid).toBe(true);
      expect(validateFileSize(MAX_FILE_SIZE - 1).valid).toBe(true);
    });

    it('应该拒绝太小的文件', () => {
      const result = validateFileSize(10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('太小');
    });

    it('应该拒绝太大的文件', () => {
      const result = validateFileSize(MAX_FILE_SIZE + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('太大');
    });
  });

  describe('isDangerousExtension', () => {
    it('应该识别危险的文件扩展名', () => {
      expect(isDangerousExtension('test.php')).toBe(true);
      expect(isDangerousExtension('test.asp')).toBe(true);
      expect(isDangerousExtension('test.jsp')).toBe(true);
      expect(isDangerousExtension('test.exe')).toBe(true);
      expect(isDangerousExtension('test.bat')).toBe(true);
      expect(isDangerousExtension('test.sh')).toBe(true);
      expect(isDangerousExtension('test.html')).toBe(true);
      expect(isDangerousExtension('test.svg')).toBe(true);
    });

    it('应该允许安全的图片扩展名', () => {
      expect(isDangerousExtension('test.jpg')).toBe(false);
      expect(isDangerousExtension('test.png')).toBe(false);
      expect(isDangerousExtension('test.gif')).toBe(false);
      expect(isDangerousExtension('test.webp')).toBe(false);
    });
  });

  describe('generateSafeFilename', () => {
    it('应该生成包含UUID的安全文件名', () => {
      const filename = generateSafeFilename('test-image', '.jpg');
      
      expect(filename).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_test-image\.jpg$/);
    });

    it('应该清理原始文件名中的危险字符', () => {
      const filename = generateSafeFilename('my"file<script>.jpg', '.jpg');
      
      expect(filename).not.toContain('"');
      expect(filename).not.toContain('<');
      expect(filename).not.toContain('>');
      expect(filename).toContain('my_file_script__jpg');
    });

    it('应该限制文件名长度', () => {
      const longName = 'a'.repeat(100);
      const filename = generateSafeFilename(longName, '.png');
      
      const namePart = filename.split('_')[1];
      expect(namePart.length).toBeLessThanOrEqual(54);
    });

    it('应该保留中文字符', () => {
      const filename = generateSafeFilename('测试图片', '.jpg');
      
      expect(filename).toContain('测试图片');
    });

    it('应该保持扩展名不变', () => {
      const filename1 = generateSafeFilename('test', '.jpg');
      const filename2 = generateSafeFilename('test', '.png');
      const filename3 = generateSafeFilename('test', '.gif');
      
      expect(filename1.endsWith('.jpg')).toBe(true);
      expect(filename2.endsWith('.png')).toBe(true);
      expect(filename3.endsWith('.gif')).toBe(true);
    });
  });

  describe('validateFileMagicNumber', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-upload-test-'));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('应该识别JPEG文件头', async () => {
      const filePath = path.join(tempDir, 'test.jpg');
      const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      await fs.writeFile(filePath, Buffer.from(jpegHeader));
      
      const result = await validateFileMagicNumber(filePath, 'image/jpeg');
      
      expect(result).toBe(true);
    });

    it('应该识别PNG文件头', async () => {
      const filePath = path.join(tempDir, 'test.png');
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      await fs.writeFile(filePath, Buffer.from(pngHeader));
      
      const result = await validateFileMagicNumber(filePath, 'image/png');
      
      expect(result).toBe(true);
    });

    it('应该识别GIF文件头', async () => {
      const filePath = path.join(tempDir, 'test.gif');
      const gifHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x0a, 0x00, 0x0a, 0x00, 0x80, 0x00]);
      await fs.writeFile(filePath, Buffer.from(gifHeader));
      
      const result = await validateFileMagicNumber(filePath, 'image/gif');
      
      expect(result).toBe(true);
    });

    it('应该识别WebP文件头', async () => {
      const filePath = path.join(tempDir, 'test.webp');
      const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x22, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
      await fs.writeFile(filePath, Buffer.from(webpHeader));
      
      const result = await validateFileMagicNumber(filePath, 'image/webp');
      
      expect(result).toBe(true);
    });

    it('应该拒绝非图片内容', async () => {
      const filePath = path.join(tempDir, 'fake.jpg');
      const phpContent = new Uint8Array([0x3c, 0x3f, 0x70, 0x68, 0x70, 0x20, 0x70, 0x68, 0x70, 0x69, 0x6e, 0x66]);
      await fs.writeFile(filePath, Buffer.from(phpContent));
      
      const result = await validateFileMagicNumber(filePath, 'image/jpeg');
      
      expect(result).toBe(false);
    });

    it('应该拒绝MIME类型与内容不匹配的文件', async () => {
      const filePath = path.join(tempDir, 'test.png');
      const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      await fs.writeFile(filePath, Buffer.from(jpegHeader));
      
      const result = await validateFileMagicNumber(filePath, 'image/png');
      
      expect(result).toBe(false);
    });

    it('应该对不存在的文件返回false', async () => {
      const filePath = path.join(tempDir, 'nonexistent.jpg');
      
      const result = await validateFileMagicNumber(filePath, 'image/jpeg');
      
      expect(result).toBe(false);
    });
  });

  describe('ensureUploadDirectory', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-test-'));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('应该创建不存在的目录', async () => {
      const newDir = path.join(tempDir, 'new-uploads', 'subdir');
      
      await ensureUploadDirectory(newDir);
      
      const stats = await fs.stat(newDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('不应该对已存在的目录报错', async () => {
      const existingDir = path.join(tempDir, 'existing');
      await fs.mkdir(existingDir, { recursive: true });
      
      await expect(ensureUploadDirectory(existingDir)).resolves.not.toThrow();
    });
  });

  describe('综合验证测试', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validation-test-'));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('应该验证有效的JPEG文件', async () => {
      const filePath = path.join(tempDir, 'valid.jpg');
      const jpegContent = Buffer.concat([
        Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]),
        Buffer.alloc(200, 0x00),
      ]);
      await fs.writeFile(filePath, jpegContent);
      
      const result = await validateImageFile(
        filePath,
        'test-image.jpg',
        212,
        'image/jpeg'
      );
      
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.extension).toBe('.jpg');
    });

    it('应该拒绝伪装成JPEG的PHP文件', async () => {
      const filePath = path.join(tempDir, 'fake.jpg');
      const phpContent = Buffer.from('<?php phpinfo(); ?>');
      await fs.writeFile(filePath, phpContent);
      
      const result = await validateImageFile(
        filePath,
        'fake.jpg',
        phpContent.length,
        'image/jpeg'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('文件内容');
    });

    it('应该拒绝扩展名与MIME类型不匹配的文件', async () => {
      const filePath = path.join(tempDir, 'test.png');
      const jpegContent = Buffer.concat([
        Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]),
        Buffer.alloc(200, 0x00),
      ]);
      await fs.writeFile(filePath, jpegContent);
      
      const result = await validateImageFile(
        filePath,
        'test.png',
        212,
        'image/png'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MIME类型');
    });

    it('应该拒绝太小的文件', async () => {
      const filePath = path.join(tempDir, 'small.jpg');
      await fs.writeFile(filePath, Buffer.alloc(10, 0x00));
      
      const result = await validateImageFile(
        filePath,
        'small.jpg',
        10,
        'image/jpeg'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('太小');
    });

    it('应该拒绝不支持的MIME类型', async () => {
      const filePath = path.join(tempDir, 'test.pdf');
      await fs.writeFile(filePath, Buffer.alloc(1000, 0x00));
      
      const result = await validateImageFile(
        filePath,
        'test.pdf',
        1000,
        'application/pdf'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('不支持的文件类型');
    });
  });

  describe('边界条件测试', () => {
    it('应该正确处理大小写不敏感的扩展名', () => {
      expect(validateFileExtension('test.JPG', 'image/jpeg')).toBe(true);
      expect(validateFileExtension('test.PNG', 'image/png')).toBe(true);
      expect(validateFileExtension('test.GIF', 'image/gif')).toBe(true);
      
      expect(isDangerousExtension('TEST.PHP')).toBe(true);
      expect(isDangerousExtension('Test.Html')).toBe(true);
    });

    it('应该正确处理双重扩展名', () => {
      expect(isDangerousExtension('image.jpg.php')).toBe(true);
      expect(isDangerousExtension('photo.gif.html')).toBe(true);
      expect(isDangerousExtension('test.png.exe')).toBe(true);
    });

    it('应该正确处理空文件名', () => {
      expect(isDangerousExtension('')).toBe(false);
      expect(isDangerousExtension('.php')).toBe(true);
    });
  });
});
