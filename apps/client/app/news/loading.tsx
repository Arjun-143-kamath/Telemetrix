export default function NewsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pt-32 pb-24 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="w-64 h-12 bg-muted rounded mb-12"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`rounded-3xl bg-muted/20 border border-border/10 aspect-video ${i === 1 ? 'col-span-1 sm:col-span-2 sm:row-span-2' : ''}`}></div>
        ))}
      </div>
    </div>
  );
}
