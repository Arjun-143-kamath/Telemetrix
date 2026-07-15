export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-md p-5 h-32">
            <div className="w-1/3 h-4 bg-muted rounded mb-6"></div>
            <div className="w-1/2 h-8 bg-muted rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-md p-6 h-[400px]">
           <div className="w-1/4 h-6 bg-muted rounded mb-6"></div>
           <div className="w-full h-[250px] bg-muted/50 rounded mb-6"></div>
        </div>
        <div className="flex flex-col gap-6">
           <div className="bg-card border border-border rounded-md p-6 h-48">
              <div className="w-1/2 h-6 bg-muted rounded mb-6"></div>
              <div className="w-full h-12 bg-muted/50 rounded"></div>
           </div>
           <div className="bg-card border border-border rounded-md p-6 flex-1">
              <div className="w-1/2 h-6 bg-muted rounded mb-6"></div>
              <div className="space-y-4">
                <div className="w-full h-8 bg-muted/50 rounded"></div>
                <div className="w-full h-8 bg-muted/50 rounded"></div>
                <div className="w-full h-8 bg-muted/50 rounded"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
