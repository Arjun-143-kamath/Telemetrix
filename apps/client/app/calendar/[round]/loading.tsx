export default function RaceDetailsLoading() {
  return (
    <div className="w-full flex flex-col pt-32 pb-24 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="w-48 h-8 bg-muted rounded mb-4"></div>
      <div className="w-96 h-12 bg-muted rounded mb-12"></div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 h-[400px] bg-muted/20 border border-border/10 rounded-[3rem]"></div>
        <div className="xl:col-span-2 h-[400px] bg-muted/20 border border-border/10 rounded-[3rem]"></div>
      </div>
      
      <div className="w-full h-[600px] bg-muted/20 border border-border/10 rounded-[3rem] mt-8"></div>
    </div>
  );
}
