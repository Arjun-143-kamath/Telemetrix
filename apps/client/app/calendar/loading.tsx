export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-pulse pb-12">
      <div className="flex justify-between items-end mb-4 px-2">
         <div>
            <div className="w-64 h-10 bg-muted rounded mb-2"></div>
            <div className="w-96 h-5 bg-muted rounded mt-1"></div>
         </div>
      </div>

      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-card/30 border border-border/30 rounded-2xl p-6 relative flex flex-col md:flex-row justify-between items-center gap-6 h-48 md:h-[180px]">
             
             {/* Status indicator bar */}
             <div className="absolute left-0 top-0 bottom-0 w-2 bg-muted"></div>

             {/* Left side info */}
             <div className="flex-1 flex flex-col w-full md:w-auto ml-4">
                <div className="w-24 h-4 bg-muted rounded mb-3"></div>
                <div className="w-64 h-8 bg-muted rounded mb-2"></div>
                <div className="w-48 h-6 bg-muted rounded mb-4"></div>
                
                <div className="flex gap-6 pt-4 border-t border-border/20">
                   <div className="w-32 h-10 bg-muted rounded"></div>
                   <div className="w-24 h-10 bg-muted rounded"></div>
                </div>
             </div>

             {/* Right side track layout */}
             <div className="w-full md:w-1/3 h-full bg-muted/20 rounded-xl border-2 border-dashed border-border/10"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
