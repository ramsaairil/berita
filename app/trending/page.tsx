import TrendingWidget from "@/components/features/articles/TrendingWidget";

export default function TrendingPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">


        {/* Trending Content */}
        <TrendingWidget />
      </main>
    </div>
  );
}
