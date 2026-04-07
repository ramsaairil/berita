import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from "bcryptjs"
import "dotenv/config"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- Start Seeding Database 2026 ---')

  // 1. Create Categories
  console.log('Creating categories...')
  const techCategory = await prisma.category.upsert({
    where: { slug: 'teknologi' },
    update: {},
    create: {
      name: 'Teknologi',
      slug: 'teknologi',
      description: 'Berita seputar dunia teknologi terbaru, gadget, dan inovasi digital.',
    },
  })

  const politicsCategory = await prisma.category.upsert({
    where: { slug: 'politik' },
    update: {},
    create: {
      name: 'Politik',
      slug: 'politik',
      description: 'Berita dan dinamika politik nasional maupun internasional terkini.',
    },
  })

  const sportsCategory = await prisma.category.upsert({
    where: { slug: 'olahraga' },
    update: {},
    create: {
      name: 'Olahraga',
      slug: 'olahraga',
      description: 'Berita dan dinamika olahraga nasional maupun internasional terkini.',
    },
  })

  const entertainmentCategory = await prisma.category.upsert({
    where: { slug: 'hiburan' },
    update: {},
    create: {
      name: 'Hiburan',
      slug: 'hiburan',
      description: 'Berita dan dinamika hiburan nasional maupun internasional terkini.',
    },
  })

  const lifestyleCategory = await prisma.category.upsert({
    where: { slug: 'gaya-hidup' },
    update: {},
    create: {
      name: 'Gaya Hidup',
      slug: 'gaya-hidup',
      description: 'Berita dan dinamika gaya hidup nasional maupun internasional terkini.',
    },
  })

  const healthCategory = await prisma.category.upsert({
    where: { slug: 'kesehatan' },
    update: {},
    create: {
      name: 'Kesehatan',
      slug: 'kesehatan',
      description: 'Berita dan dinamika kesehatan nasional maupun internasional terkini.',
    },
  })

  const educationCategory = await prisma.category.upsert({
    where: { slug: 'pendidikan' },
    update: {},
    create: {
      name: 'Pendidikan',
      slug: 'pendidikan',
      description: 'Berita dan dinamika pendidikan nasional maupun internasional terkini.',
    },
  })

  const travelCategory = await prisma.category.upsert({
    where: { slug: 'travel' },
    update: {},
    create: {
      name: 'Travel',
      slug: 'travel',
      description: 'Berita dan dinamika travel nasional maupun internasional terkini.',
    },
  })

  const foodCategory = await prisma.category.upsert({
    where: { slug: 'kuliner' },
    update: {},
    create: {
      name: 'Kuliner',
      slug: 'kuliner',
      description: 'Berita dan dinamika kuliner nasional maupun internasional terkini.',
    },
  })

  const automotiveCategory = await prisma.category.upsert({
    where: { slug: 'otomotif' },
    update: {},
    create: {
      name: 'Otomotif',
      slug: 'otomotif',
      description: 'Berita dan dinamika otomotif nasional maupun internasional terkini.',
    },
  })

  const financeCategory = await prisma.category.upsert({
    where: { slug: 'keuangan' },
    update: {},
    create: {
      name: 'Keuangan',
      slug: 'keuangan',
      description: 'Berita dan dinamika keuangan nasional maupun internasional terkini.',
    },
  })

  // 2. Create Tags
  console.log('Creating tags...')
  const aiTag = await prisma.tag.upsert({
    where: { slug: 'ai' },
    update: {},
    create: { name: 'Artificial Intelligence', slug: 'ai' },
  })
  
  const gadgetTag = await prisma.tag.upsert({
    where: { slug: 'gadget' },
    update: {},
    create: { name: 'Gadget', slug: 'gadget' },
  })

  // 3. Create Users
  console.log('Creating users...')
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedUserPassword = await bcrypt.hash("user123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@berita.com' },
    update: { password: hashedAdminPassword },
    create: {
      email: 'admin@berita.com',
      name: 'Admin Berita Utama',
      role: 'ADMIN',
      password: hashedAdminPassword,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  })

  // 4. Create Articles (List 14 Berita)
  console.log('Preparing articles list...')
  const articlesToSeed = [
    // --- TEKNOLOGI ---
    {
      title: 'Perkembangan Artificial Intelligence di Tahun 2026',
      slug: 'perkembangan-ai-di-tahun-2026',
      content: 'Tahun 2026 menjadi titik balik penerapan AI di berbagai sektor industri. Dengan kemampuan analitik yang semakin tajam, AI kini mampu membantu pengambilan keputusan medis hingga kebijakan publik secara presisi.',
      excerpt: 'Tahun 2026 menjadi titik balik penerapan AI di berbagai sektor industri...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000',
    },
    {
      title: 'Peluncuran Smartphone Holografik Pertama di Indonesia',
      slug: 'peluncuran-smartphone-holografik-pertama',
      content: 'Industri gadget tanah air dihebohkan dengan munculnya smartphone berkemampuan proyeksi holografik 3D tanpa kacamata khusus. Teknologi ini diprediksi akan mengubah cara kita melakukan video call di masa depan.',
      excerpt: 'Industri gadget tanah air dihebohkan dengan munculnya smartphone holografik...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1000',
    },
    {
      title: 'Inovasi Baterai Mobil Listrik Generasi Terbaru',
      slug: 'inovasi-baterai-mobil-listrik-gen-5',
      content: 'Perusahaan teknologi lokal berhasil menemukan cara meningkatkan efisiensi baterai hingga 200%, membuat kendaraan listrik lebih terjangkau dan memiliki jarak tempuh yang jauh lebih lama.',
      excerpt: 'Perusahaan teknologi lokal berhasil menemukan cara meningkatkan efisiensi baterai...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000',
    },
    {
      title: 'Starlink Gen-4 Kini Jangkau Desa Terpencil di Papua',
      slug: 'starlink-gen-4-jangkau-papua',
      content: 'Kecepatan internet di wilayah 3T kini setara dengan Jakarta berkat teknologi satelit terbaru. Pendidikan digital di pelosok Papua pun mulai menunjukkan hasil positif yang signifikan.',
      excerpt: 'Kecepatan internet di wilayah 3T kini setara dengan Jakarta berkat satelit...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1000',
    },
    {
      title: 'Sistem Keamanan Siber Nasional Berbasis Kuantum',
      slug: 'keamanan-siber-nasional-kuantum',
      content: 'Pemerintah meresmikan pusat data nasional yang diproteksi dengan enkripsi kuantum. Langkah ini diambil untuk mencegah kebocoran data massal yang sering terjadi sebelumnya.',
      excerpt: 'Pemerintah meresmikan pusat data nasional dengan enkripsi kuantum...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000',
    },
    {
      title: 'AI Kini Mampu Prediksi Gempa Bumi 2 Jam Sebelum Kejadian',
      slug: 'ai-prediksi-gempa-bumi',
      content: 'Para peneliti di ITB berhasil menyempurnakan algoritma AI yang terintegrasi dengan sensor bawah laut. Sistem ini memberikan waktu evakuasi lebih lama bagi warga pesisir.',
      excerpt: 'Peneliti ITB berhasil menyempurnakan algoritma AI untuk deteksi dini gempa...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000',
    },
    {
      title: 'Robot Kurir Mulai Beroperasi di Kawasan Sudirman',
      slug: 'robot-kurir-operasional-sudirman',
      content: 'Pemandangan unik terlihat di trotoar Sudirman, deretan robot kurir otonom mulai mengantarkan paket makanan ke gedung-gedung perkantoran tanpa pengemudi manusia.',
      excerpt: 'Pemandangan unik terlihat di trotoar Sudirman dengan robot kurir otonom...',
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000',
    },

    // --- POLITIK ---
    {
      title: 'Pemilu Serentak Siap Digelar Tahun Depan',
      slug: 'pemilu-serentak-siap-digelar',
      content: 'Komisi Pemilihan Umum (KPU) telah mematangkan berbagai persiapan menjelang pesta demokrasi. Diharapkan partisipasi publik meningkat seiring kemudahan akses informasi digital.',
      excerpt: 'Komisi Pemilihan Umum (KPU) telah mematangkan persiapan demokrasi...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1000',
    },
    {
      title: 'Koalisi Besar Terbentuk Menjelang Pilkada Serentak',
      slug: 'koalisi-besar-pilkada-serentak',
      content: 'Lima partai besar secara mengejutkan mengumumkan koalisi tunggal untuk mendukung calon gubernur di wilayah strategis. Langkah ini dianggap sebagai strategi politik besar.',
      excerpt: 'Lima partai besar mengumumkan koalisi tunggal untuk Pilkada mendatang...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?q=80&w=1000',
    },
    {
      title: 'DPR Sahkan RUU Perlindungan Kreator Konten Digital',
      slug: 'dpr-sahkan-ruu-kreator-digital',
      content: 'Setelah perdebatan panjang, akhirnya payung hukum untuk para YouTuber dan influencer disahkan. Kini mereka memiliki hak perlindungan royalti dan asuransi profesi yang jelas.',
      excerpt: 'Payung hukum untuk para YouTuber dan influencer akhirnya resmi disahkan...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?q=80&w=1000',
    },
    {
      title: 'Indonesia Resmi Pindahkan Pusat Pemerintahan ke IKN Tahap 3',
      slug: 'pemindahan-pemerintahan-ikn-tahap-3',
      content: 'Upacara peresmian istana baru menandai selesainya tahap ketiga pembangunan IKN. Seluruh kementerian teknis mulai berkantor secara penuh di Kalimantan mulai bulan depan.',
      excerpt: 'Upacara peresmian istana baru menandai selesainya tahap ketiga IKN...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1590212151175-e58edd96185b?q=80&w=1000',
    },
    {
      title: 'Rekonsiliasi Politik Nasional Pasca Debat Panas',
      slug: 'rekonsiliasi-politik-nasional',
      content: 'Dua kubu yang sempat bersitegang akhirnya bertemu untuk rekonsiliasi. Pertemuan ini mendinginkan suasana politik yang sempat memanas di berbagai platform media sosial.',
      excerpt: 'Dua kubu yang sempat bersitegang akhirnya bertemu untuk rekonsiliasi...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000',
    },
    {
      title: 'Anak Muda Mendominasi Bursa Calon Kepala Daerah 2026',
      slug: 'anak-muda-dominasi-calon-kepala-daerah',
      content: 'Data KPU menunjukkan tren baru: lebih dari 40% calon pemimpin daerah berasal dari kalangan milenial dan Gen Z yang membawa visi digitalisasi birokrasi pemerintahan.',
      excerpt: 'Lebih dari 40% calon pemimpin daerah berasal dari kalangan milenial...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000',
    },
    {
      title: 'Strategi Diplomasi di Era Baru Globalisasi',
      slug: 'strategi-diplomasi-era-baru',
      content: 'Pertemuan antar pemimpin negara di Jakarta menghasilkan kesepakatan penting terkait keamanan regional dan kerjasama ekonomi sirkular yang berkelanjutan.',
      excerpt: 'Pertemuan antar pemimpin negara di Jakarta menghasilkan kesepakatan penting...',
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000',
    }
  ];

  console.log(`Seeding ${articlesToSeed.length} articles...`);

  for (const item of articlesToSeed) {
    await prisma.article.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...item,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: adminUser.id,
        // Hubungkan tags ke artikel pertama saja sebagai contoh
        tags: item.slug === 'perkembangan-ai-di-tahun-2026' ? {
          connect: [{ id: aiTag.id }, { id: gadgetTag.id }]
        } : undefined
      },
    });
  }

  console.log('--- Seeding Finished Successfully ---')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })