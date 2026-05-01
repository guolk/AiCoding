import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  
  const { title, content } = body;
  
  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: '标题和内容不能为空',
    });
  }
  
  const article = await prisma.article.create({
    data: {
      title,
      content,
      authorId: user.userId,
      status: 'published',
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
  
  return {
    success: true,
    data: article,
    message: '文章创建成功',
  };
});
