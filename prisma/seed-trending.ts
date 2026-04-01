import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import "dotenv/config"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

// Manually parse RSS XML since we can't import rss-parser in a plain tsx script easily
async function fetchAndParseRSS(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
  })
  const xml = await res.text()

  const items: { title: string; link: string; description: string; pubDate: string; imageUrl: string | null }[] = []

  // Match all <item> blocks
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

  for (const block of itemBlocks) {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'))
      return m ? m[1].trim() : ''
    }

    // Get image from enclosure or media:content or media:thumbnail
    let imageUrl: string | null = null
    const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/)
    const mediaContent = block.match(/<media:content[^>]+url="([^"]+)"/)
    const mediaThumbnail = block.match(/<media:thumbnail[^>]+url="([^"]+)"/)
    const imgInDesc = get('description').match(/<img[^>]+src="([^"]+)"/)

    imageUrl = enclosure?.[1] || mediaThumbnail?.[1] || mediaContent?.[1] || imgInDesc?.[1] || null

    // Clean HTML from description
    const rawDesc = get('description').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()

    const title = get('title')
    const link = get('link') || block.match(/<link>(.*?)<\/link>/)?.[1]?.trim() || ''

    if (title && link) {
      items.push({
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        link,
        description: rawDesc.slice(0, 300),
        pubDate: get('pubDate'),
        imageUrl,
      })
    }
  }

  return items
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now()
}

// Category mapping based on RSS feed source
const RSS_FEEDS = [
  { url: 'https://www.antaranews.com/rss/terkini.xml', categorySlug: 'nasional', categoryName: 'Nasional' },
  { url: 'https://www.antaranews.com/rss/ekonomi.xml', categorySlug: 'ekonomi', categoryName: 'Ekonomi' },
  { url: 'https://www.antaranews.com/rss/olahraga.xml', categorySlug: 'olahraga', categoryName: 'Olahraga' },
  { url: 'https://www.antaranews.com/rss/teknologi.xml', categorySlug: 'teknologi', categoryName: 'Teknologi' },
]

async function main() {
  console.log('🗑️  Menghapus semua artikel lama...')

  // Delete all articles (cascade will handle comments, likes, bookmarks, etc.)
  await prisma.article.deleteMany({})
  console.log('✅ Semua artikel lama telah dihapus.')

  // Ensure categories exist
  console.log('\n📂 Mempersiapkan kategori...')
  const categoryMap: Record<string, string> = {}
  for (const feed of RSS_FEEDS) {
    const cat = await prisma.category.upsert({
      where: { slug: feed.categorySlug },
      update: {},
      create: {
        name: feed.categoryName,
        slug: feed.categorySlug,
        description: `Berita ${feed.categoryName} terkini`,
      },
    })
    categoryMap[feed.categorySlug] = cat.id
    console.log(`  ✓ Kategori "${feed.categoryName}" siap`)
  }

  // Ensure admin user exists
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!adminUser) {
    console.error('❌ Tidak ada user ADMIN di database. Jalankan seed utama dulu.')
    process.exit(1)
  }
  console.log(`\n👤 Menggunakan admin: ${adminUser.name}`)

  // Fetch and seed articles
  console.log('\n📰 Mengambil berita trending dari Antara News...')
  let totalInserted = 0

  for (const feed of RSS_FEEDS) {
    if (totalInserted >= 20) break

    try {
      console.log(`  Fetching: ${feed.url}`)
      const items = await fetchAndParseRSS(feed.url)
      const take = Math.min(items.length, 20 - totalInserted, 6) // max 6 per feed

      for (let i = 0; i < take; i++) {
        const item = items[i]
        const slug = slugify(item.title)

        try {
          await prisma.article.create({
            data: {
              title: item.title,
              slug,
              content: `<p>${item.description || item.title}</p>\n<p>Baca selengkapnya di <a href="${item.link}" target="_blank">Antara News</a>.</p>`,
              excerpt: item.description || item.title,
              featuredImg: item.imageUrl,
              status: 'PUBLISHED',
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              authorId: adminUser.id,
              categoryId: categoryMap[feed.categorySlug],
            },
          })
          totalInserted++
          console.log(`    ✓ [${totalInserted}] ${item.title.slice(0, 60)}...`)
        } catch (err: any) {
          console.warn(`    ⚠ Lewati (slug konflik): ${item.title.slice(0, 50)}`)
        }
      }
    } catch (err) {
      console.error(`  ❌ Gagal fetch dari ${feed.url}:`, err)
    }
  }

  console.log(`\n🎉 Selesai! ${totalInserted} berita trending berhasil ditambahkan.`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
