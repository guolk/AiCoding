import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import {
  validateImageFile,
  generateSafeFilename,
  ensureUploadDirectory,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  isDangerousExtension,
} from '../../utils/file-upload';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const MAX_FILES = 1;

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  await ensureUploadDirectory(UPLOAD_DIR);
  
  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    allowEmptyFiles: false,
    filter: (part) => {
      const filename = part.originalFilename || '';
      
      if (isDangerousExtension(filename)) {
        console.warn(`拒绝危险文件: ${filename}`);
        return false;
      }
      
      return true;
    },
    filename: (name, ext, part) => {
      const originalName = part.originalFilename || name;
      return `temp_${Date.now()}_${Math.random().toString(36).substring(2)}${ext}`;
    },
  });
  
  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        if (err.message?.includes('maxFileSize')) {
          reject(createError({
            statusCode: 400,
            message: `文件大小超过限制，最大允许 ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
          }));
        } else {
          reject(createError({
            statusCode: 400,
            message: '文件解析失败: ' + err.message,
          }));
        }
        return;
      }
      
      const file = files.file?.[0] || files.image?.[0];
      
      if (!file) {
        reject(createError({
          statusCode: 400,
          message: '未找到上传的文件',
        }));
        return;
      }
      
      const originalName = file.originalFilename || 'unknown';
      const tempPath = file.filepath;
      
      try {
        const validation = await validateImageFile(
          tempPath,
          originalName,
          file.size,
          file.mimetype || 'application/octet-stream'
        );
        
        if (!validation.valid) {
          try {
            await fs.unlink(tempPath);
          } catch {
            // 忽略清理错误
          }
          
          reject(createError({
            statusCode: 400,
            message: validation.error || '文件验证失败',
          }));
          return;
        }
        
        const safeFilename = generateSafeFilename(
          originalName,
          validation.extension!
        );
        
        const finalPath = path.join(UPLOAD_DIR, safeFilename);
        
        await fs.rename(tempPath, finalPath);
        
        await fs.chmod(finalPath, 0o640);
        
        const fileUrl = `/uploads/images/${safeFilename}`;
        
        resolve({
          success: true,
          data: {
            url: fileUrl,
            filename: safeFilename,
            originalName: originalName,
            size: file.size,
            mimeType: validation.mimeType,
            extension: validation.extension,
          },
          message: '文件上传成功',
          allowedTypes: Object.keys(ALLOWED_IMAGE_TYPES),
        });
      } catch (validationError: unknown) {
        try {
          await fs.unlink(tempPath);
        } catch {
          // 忽略清理错误
        }
        
        if (validationError instanceof Error && (validationError as any).statusCode) {
          reject(validationError);
        } else {
          reject(createError({
            statusCode: 500,
            message: '文件处理失败',
          }));
        }
      }
    });
  });
});
