"use server";

import { supabase } from "@/lib/supabase";

export async function searchArticles(query: string) {
  if (!query || query.trim().length === 0) return [];
  
  try {
    const { data: articles, error } = await supabase
      .from("Article")
      .select("id, slug, title, featuredImg")
      .ilike("title", `%${query}%`)
      .limit(6);

    if (error) {
      console.error("Supabase search error:", error);
      return [];
    }

    return articles;
  } catch (error) {
    console.error("Search catch error:", error);
    return [];
  }
}
