import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export const getArticlesForHome = unstable_cache(
  async (from: number, to: number) => {
    const [articlesRes, countRes] = await Promise.all([
      supabase
        .from("Article")
        .select(`
          *,
          author:User (
            id,
            name,
            image
          ),
          category:Category (
            id,
            name,
            slug
          )
        `)
        .eq("status", "PUBLISHED")
        .order("createdAt", { ascending: false })
        .range(from, to),
      supabase
        .from("Article")
        .select("*", { count: "exact", head: true })
        .eq("status", "PUBLISHED")
    ]);
    
    return {
      articles: articlesRes.data || [],
      totalArticles: countRes.count || 0,
    };
  },
  ["home-articles"],
  { revalidate: 60 } // cache for 60 seconds
);

export const getArticleBySlug = unstable_cache(
  async (slug: string) => {
    const { data: article, error } = await supabase
      .from("Article")
      .select(`
        *,
        author:User (
          id,
          name,
          image
        ),
        category:Category (
          id,
          name,
          slug
        ),
        tags:Tag (*),
        likes:Like (userId),
        bookmarks:Bookmark (userId),
        comments:Comment (
          *,
          author:User (
            id,
            name,
            image
          ),
          commentLikes:CommentLike (*)
        )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !article) return null;
    return article;
  },
  ["article-by-slug"],
  { revalidate: 60 } // cache for 60 seconds
);

export const getRelatedArticles = unstable_cache(
  async (articleId: string) => {
    const { data: relatedArticles } = await supabase
      .from("Article")
      .select(`
        *,
        author:User (
          id,
          name,
          image
        ),
        category:Category (
          id,
          name,
          slug
        )
      `)
      .neq("id", articleId)
      .eq("status", "PUBLISHED")
      .order("createdAt", { ascending: false })
      .limit(3);
    
    return relatedArticles || [];
  },
  ["related-articles"],
  { revalidate: 3600 } // cache for 1 hour
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const { data: category, error: categoryError } = await supabase
      .from("Category")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
      
    if (categoryError || !category) return null;
    return category;
  },
  ["category-by-slug"],
  { revalidate: 3600 }
);

export const getArticlesByCategory = unstable_cache(
  async (categoryId: string) => {
    const { data: articles, error: articlesError } = await supabase
      .from("Article")
      .select(`
        *,
        author:User (
          id,
          name,
          image
        ),
        category:Category (
          id,
          name,
          slug
        )
      `)
      .eq("categoryId", categoryId)
      .eq("status", "PUBLISHED")
      .order("createdAt", { ascending: false });
      
    if (articlesError || !articles) return [];
    return articles;
  },
  ["articles-by-category"],
  { revalidate: 60 }
);
