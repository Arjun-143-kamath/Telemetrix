export default function Loading() {
  return (
    <div className="w-full flex flex-col animate-pulse">
      
      {/* SKELETON: Next Race Hero */}
      <section className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] min-h-[100vh] -mt-4 md:-mt-8 -ml-4 md:-ml-8 flex items-stretch overflow-hidden pl-8 sm:pl-12 lg:pl-24 pr-0">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between z-10 h-full">
          {/* Left Side */}
          <div className="w-full lg:w-[45%] flex flex-col gap-10 lg:pr-8 pt-8 lg:pt-16 h-full justify-start">
             <div>
                <div className="w-24 h-6 bg-muted rounded mb-6"></div>
                <div className="w-3/4 h-24 bg-muted rounded mb-4"></div>
                <div className="w-1/2 h-6 bg-muted rounded mb-1"></div>
                <div className="w-1/3 h-5 bg-muted rounded mb-10"></div>
                <div className="w-48 h-32 bg-muted rounded mb-6"></div>
             </div>
             
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 border-t border-border/40 pt-8 mt-2">
                <div className="flex flex-col gap-5">
                   <div className="w-16 h-4 bg-muted rounded"></div>
                   <div className="w-24 h-8 bg-muted rounded"></div>
                   <div className="w-24 h-8 bg-muted rounded"></div>
                   <div className="w-24 h-8 bg-muted rounded"></div>
                </div>
                <div className="flex flex-col gap-5">
                   <div className="w-16 h-4 bg-muted rounded"></div>
                   <div className="w-20 h-10 bg-muted rounded"></div>
                   <div className="w-20 h-10 bg-muted rounded"></div>
                </div>
                <div className="flex flex-col gap-5 col-span-2 lg:col-span-1">
                   <div className="w-16 h-4 bg-muted rounded"></div>
                   <div className="w-32 h-6 bg-muted rounded"></div>
                   <div className="w-32 h-6 bg-muted rounded"></div>
                   <div className="w-32 h-6 bg-muted rounded"></div>
                </div>
             </div>
          </div>
          {/* Right Side */}
          <div className="w-full lg:w-[55%] h-[50vh] lg:h-full flex items-center justify-end relative p-12">
             <div className="w-full h-full bg-muted/10 rounded-[3rem] border border-border/10"></div>
          </div>
        </div>
      </section>

      {/* SKELETON: Previous Race Hero */}
      <section className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] min-h-[100vh] -ml-4 md:-ml-8 flex items-stretch overflow-hidden pl-8 sm:pl-12 lg:pl-24 pr-8 lg:pr-24 border-t border-border/20 mt-12">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between z-10 h-full py-16 gap-12 lg:gap-24">
          
          {/* Left Side */}
          <div className="w-full lg:w-[45%] flex flex-col gap-10 h-full justify-start sticky top-16">
            <div>
              <div className="w-32 h-6 bg-muted rounded mb-6"></div>
              <div className="w-3/4 h-20 bg-muted rounded mb-2"></div>
              <div className="w-1/2 h-6 bg-muted rounded mb-10"></div>
            </div>
            
            <div className="w-full h-56 bg-card/30 border border-border/30 rounded-3xl"></div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="w-full h-24 bg-card/30 border border-border/30 rounded-2xl"></div>
              <div className="w-full h-24 bg-card/30 border border-border/30 rounded-2xl"></div>
              <div className="w-full h-24 bg-card/30 border border-border/30 rounded-2xl"></div>
              <div className="w-full h-24 bg-card/30 border border-border/30 rounded-2xl"></div>
            </div>
          </div>

          {/* Right Side Classification Table */}
          <div className="w-full lg:w-[55%] h-[80vh] flex flex-col relative border border-border/30 rounded-3xl bg-card/20 overflow-hidden">
             <div className="w-full px-8 py-6 border-b border-border/30 bg-card/40 flex justify-between">
                <div className="w-48 h-6 bg-muted rounded"></div>
                <div className="w-24 h-4 bg-muted rounded"></div>
             </div>
             <div className="flex-1 p-4 flex flex-col gap-2">
               {[1,2,3,4,5,6,7,8,9,10].map(i => (
                 <div key={i} className="w-full h-20 bg-muted/20 rounded-2xl"></div>
               ))}
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}
