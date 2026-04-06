import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import ArticleImageUpload from "@/components/features/articles/ArticleImageUpload";

export default async function WritePage() {
  const { data: categoriesRes } = await supabase.from("Category").select("*");
  const categories = categoriesRes || [];
  
  // Karena belum ada login, kita ambil user ADMIN pertama secara otomatis sebagai penulis
  const { data: defaultUser } = await supabase
    .from("User")
    .select("*")
    .eq("role", "ADMIN")
    .limit(1)
    .maybeSingle();

  async function createArticle(formData: FormData) {
    "use server";

    if (!defaultUser) throw new Error("No admin user found to be the author.");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryId = formData.get("categoryId") as string;
    const excerpt = formData.get("excerpt") as string;
    const imageFile = formData.get("featuredImg") as File;

    let featuredImg = null;

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      if (!imageFile.type.startsWith("image/")) {
        throw new Error("File yang diunggah harus berupa gambar (JPG, PNG, dsb).");
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran gambar maksimal adalah 5MB.");
      }

      const bytes = await imageFile.arrayBuffer();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFilename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const filename = `${uniqueSuffix}-${safeFilename}`;

      if (process.env.VERCEL || process.env.NODE_ENV === "production") {
        // Upload to Supabase Storage in production / Vercel
        const { error: uploadError } = await supabaseAdmin.storage
          .from("uploads")
          .upload(`articles/${filename}`, bytes, {
            contentType: imageFile.type,
            upsert: false
          });
          
        if (uploadError) {
          console.error("Supabase storage error:", uploadError);
          throw new Error("Gagal upload gambar. Hubungi administrator.");
        }
        
        const { data: publicUrlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(`articles/${filename}`);
          
        featuredImg = publicUrlData.publicUrl;
      } else {
        // Local dev storage fallback
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
        
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {}

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        featuredImg = `/uploads/articles/${filename}`;
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const { error } = await supabaseAdmin.from("Article").insert({
      title,
      content,
      excerpt,
      featuredImg,
      slug,
      status: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      authorId: defaultUser.id,
      categoryId: categoryId,
    });

    if (error) {
      console.error("Create article error:", error);
      throw new Error("Gagal menerbitkan berita.");
    }

    revalidatePath("/");
    redirect("/");
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black font-sans text-gray-900 dark:text-white uppercase tracking-tight">Tulis Berita Baru</h1>
        </div>
        <form action={createArticle} className="space-y-4 bg-white dark:bg-zinc-900 p-6 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          
          {/* Row 1: Title + Image side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-5">
            {/* Left: Title, Category, Excerpt */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">Judul Artikel</label>
                <input 
                  name="title" 
                  required 
                  className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300" 
                  placeholder="Masukkan judul berita..." 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId" required className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none cursor-pointer transition-all">
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">Ringkasan</label>
                  <input 
                    name="excerpt" 
                    className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300" 
                    placeholder="Ringkasan singkat..." 
                  />
                </div>
              </div>
            </div>

            {/* Right: Image Upload */}
            <div className="lg:row-span-1">
              <ArticleImageUpload />
            </div>
          </div>

          {/* Row 2: Content - Full Width */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">Isi Berita</label>
            <textarea 
              name="content" 
              required 
              className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-3 rounded-2xl h-[280px] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all resize-y leading-relaxed placeholder:text-gray-300" 
              placeholder="Tuliskan berita lengkap..."
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
              Terbitkan
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
