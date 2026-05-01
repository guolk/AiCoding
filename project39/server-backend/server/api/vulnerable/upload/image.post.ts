import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filename: (name, ext, part) => {
      const originalName = part.originalFilename || name;
      return `${uuidv4()}_${originalName}`;
    },
  });
  
  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(createError({
          statusCode: 400,
          message: '文件解析失败: ' + err.message,
        }));
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
      
      const fileUrl = `/uploads/${path.basename(file.filepath)}`;
      
      resolve({
        success: true,
        data: {
          url: fileUrl,
          filename: file.originalFilename,
          size: file.size,
          mimetype: file.mimetype,
        },
        message: '文件上传成功',
      });
    });
  });
});
