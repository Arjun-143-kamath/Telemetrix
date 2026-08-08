export default function StandingsLoading() {
  return (
    <div className="w-full flex flex-col pt-32 pb-24 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-72 h-12 bg-muted rounded"></div>
        <div className="w-32 h-10 bg-muted/50 rounded-full"></div>
      </div>
      <div className="w-full flex flex-col xl:flex-row gap-8 lg:gap-12">
        <div className="w-full xl:w-2/3 h-[60vh] bg-muted/20 border border-border/10 rounded-[3rem]"></div>
        <div className="w-full xl:w-1/3 h-[40vh] bg-muted/20 border border-border/10 rounded-[3rem]"></div>
      </div>
    </div>
  );
}
