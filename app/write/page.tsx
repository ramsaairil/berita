import { supabase } from "@/lib/supabase";
import WriteArticleForm from "@/components/features/articles/WriteArticleForm";

export default async function WritePage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMessage = searchParams.error;

  const { data: categoriesRes } = await supabase.from("Category").select("*");
  const categories = categoriesRes || [];

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen py-12 px-4 sm:px-6">
      <WriteArticleForm categories={categories} errorMessage={errorMessage} />
    </div>
  );
}
