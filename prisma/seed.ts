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
  console.log('Seeding database with dummy data...')

  // 1. Create Categories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'teknologi' },
    update: {},
    create: {
      name: 'Teknologi',
      slug: 'teknologi',
      description: 'Berita seputar dunia teknologi terbaru',
    },
  })

  const politicsCategory = await prisma.category.upsert({
    where: { slug: 'politik' },
    update: {},
    create: {
      name: 'Politik',
      slug: 'politik',
      description: 'Berita dan dinamika politik terkini',
    },
  })

  // 2. Create Tags
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

  // Add a hashed password for seeding
  const defaultPassword = await bcrypt.hash("123456", 10);

  // 3. Create Users (Admin & User)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@berita.com' },
    update: { password: defaultPassword },
    create: {
      email: 'admin@berita.com',
      name: 'Admin Berita',
      role: 'ADMIN',
      password: defaultPassword,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@berita.com' },
    update: { password: defaultPassword },
    create: {
      email: 'user@berita.com',
      name: 'Pembaca Setia',
      role: 'USER',
      password: defaultPassword,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    },
  })

  // 4. Create Articles
  const article1 = await prisma.article.upsert({
    where: { slug: 'perkembangan-ai-di-tahun-2026' },
    update: {},
    create: {
      title: 'Perkembangan Artificial Intelligence di Tahun 2026',
      slug: 'perkembangan-ai-di-tahun-2026',
      content: 'Tahun 2026 menjadi titik balik penerapan AI di berbagai sektor industri. Dengan kemampuan analitik...',
      excerpt: 'Tahun 2026 menjadi titik balik penerapan AI di berbagai...',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: techCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
      tags: {
        connect: [{ id: aiTag.id }, { id: gadgetTag.id }]
      }
    },
  })

  const article2 = await prisma.article.upsert({
    where: { slug: 'pemilu-serentak-siap-digelar' },
    update: {},
    create: {
      title: 'Pemilu Serentak Siap Digelar Tahun Depan',
      slug: 'pemilu-serentak-siap-digelar',
      content: 'Komisi Pemilihan Umum (KPU) telah mematangkan berbagai persiapan menjelang pesta demokrasi. Diharapkan partisipasi publik meningkat...',
      excerpt: 'Komisi Pemilihan Umum (KPU) telah mematangkan persiapan demokrasi...',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: politicsCategory.id,
      featuredImg: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1000&auto=format&fit=crop',
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
