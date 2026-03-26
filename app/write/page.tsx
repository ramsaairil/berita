import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
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
    const featuredImg = formData.get("featuredImg") as string;

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
      <h1 className="text-3xl font-bold mb-8">Tulis Berita Baru</h1>
      <form action={createArticle} className="space-y-6 flex flex-col">
        <div>
          <label className="block text-sm font-medium mb-2">Judul Berita</label>
          <input name="title" required className="w-full border border-gray-300 p-3 rounded" placeholder="Judul" />
        </div>
        
        <div>
           <label className="block text-sm font-medium mb-2">URL Gambar Sampul (Opsional)</label>
           <input name="featuredImg" className="w-full border border-gray-300 p-3 rounded" placeholder="Contoh: https://images.unsplash.com/... " />
        </div>

        <div>
           <label className="block text-sm font-medium mb-2">Kategori</label>
           <select name="categoryId" required className="w-full border border-gray-300 p-3 rounded bg-white">
             {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
        </div>

        <div>
           <label className="block text-sm font-medium mb-2">Ringkasan Singkat (Opsional)</label>
           <textarea name="excerpt" className="w-full border border-gray-300 p-3 rounded h-24" placeholder="Ringkasan singkat ini akan muncul di halaman depan..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Isi Berita Utama</label>
          <textarea name="content" required className="w-full border border-gray-300 p-3 rounded h-96" placeholder="Ketik isi lengkap berita di sini..."></textarea>
        </div>

        <button type="submit" className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 self-start text-[15px] transition-colors">
          Terbitkan Berita
        </button>
      </form>
    </div>
  )
}
