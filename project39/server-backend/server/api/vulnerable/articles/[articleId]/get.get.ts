import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const articleId = parseInt(getRouterParam(event, 'articleId') || '0', 10);
  
  if (!articleId) {
    throw createError({
      statusCode: 400,
      message: '文章ID无效',
    });
  }
  
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
  
  if (!article) {
    throw createError({
      statusCode: 404,
      message: '文章不存在',
    });
  }
  
  return {
    success: true,
    data: article,
  };
});
