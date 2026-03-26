import prisma from "@/lib/prisma";

export async function getPopularCategories() {
  const categories = await prisma.category.findMany({
    include: {
      articles: {
        select: {
          _count: {
            select: { likes: true, comments: true }
          }
        }
      }
    }
  });

  const withEngagement = categories.map(cat => {
    const totalEngagement = cat.articles.reduce((acc, article) => {
      return acc + article._count.likes + article._count.comments;
    }, 0);
    
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      engagement: totalEngagement
    };
  });

  return withEngagement.sort((a, b) => b.engagement - a.engagement).slice(0, 7);
}
