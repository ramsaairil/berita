import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import ArticleImageUpload from "@/components/features/articles/ArticleImageUpload";

export default async function WritePage() {
  const categories = await prisma.category.findMany();
  
  // Karena belum ada login, kita ambil user ADMIN pertama secara otomatis sebagai penulis
  const defaultUser = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  async function createArticle(formData: FormData) {
    "use server";

    if (!defaultUser) throw new Error("No admin user found to be the author.");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryId = formData.get("categoryId") as string;
    const excerpt = formData.get("excerpt") as string;
    const imageFile = formData.get("featuredImg") as File;

    let featuredImg = null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      featuredImg = `/uploads/articles/${filename}`;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    await prisma.article.create({
      data: {
        title,
        content,
        excerpt,
        featuredImg,
        slug,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: defaultUser.id,
        categoryId: categoryId,
      }
    });

    revalidatePath("/");
    redirect("/");
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 font-sans text-gray-900 dark:text-white">Tulis Berita Baru</h1>
        <form action={createArticle} className="space-y-8 bg-white dark:bg-zinc-900 p-6 sm:p-10 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Judul Artikel</label>
            <input 
              name="title" 
              required 
              className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              placeholder="Masukkan judul berita di sini..." 
            />
          </div>
          
          <ArticleImageUpload />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
               <select name="categoryId" required className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer transition-colors">
                 {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ringkasan (Excerpt)</label>
               <input 
                 name="excerpt" 
                 className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                 placeholder="Ringkasan singkat untuk tampilan di beranda..." 
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Isi Berita</label>
            <textarea 
              name="content" 
              required 
              className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white p-4 rounded-xl h-[400px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500" 
              placeholder="Tuliskan detail berita lengkapnya di sini..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm focus:ring-4 focus:ring-blue-500/30">
              Terbitkan Berita
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
