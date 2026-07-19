import { Metadata } from 'next';
import Image from 'next/image';

export const revalidate = 60; // Cache for 1 minute

export const metadata: Metadata = {
  title: 'Latest News | Telemetrix',
  description: 'The latest Formula 1 news and updates.',
};

async function getNews() {
  try {
    const res = await fetch('http://localhost:5000/api/news', {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export default async function NewsPage() {
  const data = await getNews();

  if (!data || !data.news) {
    return <div className="p-8 text-center text-destructive">Failed to load news. Ensure backend is running.</div>;
  }

  const articles = data.news;

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4 sm:px-8 lg:px-12">
      
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10 mt-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-1.5 h-6 bg-primary rounded-full"></div>
           <span className="text-sm font-bold uppercase tracking-widest text-primary">Live Feed</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">Latest News</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          All the latest drama, technical upgrades, and driver market news right from the paddock.
        </p>
      </div>

      {/* Grid Layout */}
      {articles.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card/20 rounded-3xl border border-border/30">
          No news available at the moment. Check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 grid-flow-dense">
          {articles.map((article: any, index: number) => {
            let spanClasses = 'col-span-1 row-span-1';
            let isHero = false;

            // Make the first article and one in the middle large (Hero)
            const middleIndex = Math.floor(articles.length / 2);
            if (index === 0 || (index === middleIndex && articles.length > 4)) {
              spanClasses = 'col-span-1 sm:col-span-2 sm:row-span-2';
              isHero = true;
            }

            return (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-3xl block shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/20 aspect-video ${spanClasses}`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${article.imageUrl})` }}
                />

                {/* Bottom-up Blur Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-[2px]"></div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white bg-primary rounded-sm shadow-md">
                      {article.source}
                    </span>
                  </div>
                  <h3 className={`${isHero ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl'} font-black tracking-tight text-white leading-tight group-hover:text-primary transition-colors duration-300`}>
                    {article.title}
                  </h3>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
