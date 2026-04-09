import Parser from 'rss-parser';
import { unstable_cache } from 'next/cache';

export const revalidate = 3600;

type CustomItem = {
  title: string;
  link: string;
  pubDate: string;
  enclosure?: { url: string };
  'media:content'?: { $: { url: string } };
  'media:thumbnail'?: { $: { url: string } };
};

const customParser = new Parser<{}, CustomItem>({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
    ],
  },
});

function getImageUrl(item: CustomItem): string | null {
  return (
    item.enclosure?.url ||
    item['media:thumbnail']?.$.url ||
    item['media:content']?.$.url ||
    null
  );
}

const getTrendingItems = unstable_cache(
  async () => {
    try {
      const feed = await customParser.parseURL('https://www.antaranews.com/rss/terkini.xml');
      return (feed.items as CustomItem[]).slice(0, 5);
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
      return [];
    }
  },
  ['trending-rss'],
  { revalidate: 3600 }
);

export default async function TrendingWidget() {
  const items = await getTrendingItems();

  if (!items || items.length === 0) return null;

  return (
    <div>
      {/* Section Header — Vox style */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 shrink-0 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e62000] animate-pulse inline-block" />
          Trending Nasional
        </h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Article List with thumbnails */}
      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((item, i) => {
          const imageUrl = getImageUrl(item);
          return (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 items-start py-3.5 first:pt-0 last:pb-0"
            >
              {/* Thumbnail */}
              {imageUrl ? (
                <div className="shrink-0 w-[68px] h-[50px] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-[68px] h-[50px] bg-gray-100 flex items-center justify-center">
                  <span className="text-[18px] font-black text-gray-200">
                    {i + 1}
                  </span>
                </div>
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-[13px] font-bold text-gray-800 leading-snug group-hover:text-[#0d88b5] transition-colors duration-200 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-bold">
                  Antara · {new Date(item.pubDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
