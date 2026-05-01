import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const keyword = query.keyword as string || '';
  const page = parseInt(query.page as string || '1', 10);
  const pageSize = parseInt(query.pageSize as string || '10', 10);
  
  let articles;
  let total;
  
  if (keyword) {
    const sql = `
      SELECT * FROM Article 
      WHERE status = 'published' 
      AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
      ORDER BY createdAt DESC
      LIMIT ${(page - 1) * pageSize}, ${pageSize}
    `;
    
    const countSql = `
      SELECT COUNT(*) as count FROM Article 
      WHERE status = 'published' 
      AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
    `;
    
    const result = await prisma.$queryRawUnsafe(sql);
    const countResult = await prisma.$queryRawUnsafe(countSql);
    
    articles = result;
    total = (countResult as any)[0]?.count || 0;
  } else {
    articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    
    total = await prisma.article.count({
      where: { status: 'published' },
    });
  }
  
  return {
    success: true,
    data: {
      items: articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
