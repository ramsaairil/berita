import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import ArticleImageUpload from "@/components/ArticleImageUpload";

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
      
      // Ensure directory exists (even though we ran mkdir command, good practice)
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
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 font-serif">Tulis Berita Baru</h1>
      <form action={createArticle} className="space-y-6 flex flex-col bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Judul Berita</label>
          <input 
            name="title" 
            required 
            className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#0d88b5] focus:border-transparent outline-none transition-all" 
            placeholder="Ketik judul berita yang menarik..." 
          />
        </div>
        
        <ArticleImageUpload />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
             <select name="categoryId" required className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:ring-2 focus:ring-[#0d88b5] outline-none appearance-none cursor-pointer">
               {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Ringkasan Singkat (Opsional)</label>
             <input name="excerpt" className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#0d88b5] outline-none" placeholder="Isi ringkasan untuk halaman depan..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Isi Berita Utama</label>
          <textarea 
            name="content" 
            required 
            className="w-full border border-gray-200 p-4 rounded-xl h-96 focus:ring-2 focus:ring-[#0d88b5] outline-none resize-none" 
            placeholder="Ketik isi lengkap berita di sini..."
          ></textarea>
        </div>

        <button type="submit" className="bg-black text-white px-10 py-4 rounded-full hover:bg-gray-800 self-start text-[16px] font-bold transition-all hover:shadow-lg active:scale-95">
          Terbitkan Berita
        </button>
      </form>
    </div>
  )
}
