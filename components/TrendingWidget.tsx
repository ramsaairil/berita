import Parser from 'rss-parser';

export const revalidate = 3600; // Cache for 1 hour

export default async function TrendingWidget() {
  const parser = new Parser();
  let items: any[] = [];
  
  try {
    const feed = await parser.parseURL('https://www.antaranews.com/rss/terkini.xml');
    items = feed.items.slice(0, 5);
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return null; // Return nothing if it fails so layout doesn't break
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
      <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        Berita Trending Nasional
      </h2>
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border-b border-gray-100 pb-4 last:border-0 last:pb-0"
          >
            <h3 className="text-[14px] font-bold text-gray-800 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">
              Sumber: Antara News • {new Date(item.pubDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
