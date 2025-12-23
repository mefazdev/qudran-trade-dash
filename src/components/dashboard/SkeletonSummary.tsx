export function SkeletonSummary() {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card/30 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 p-4 rounded-lg bg-card/40 flex items-center gap-4 border border-white/5 animate-pulse">
                    <div className="p-3 bg-white/5 rounded-full h-12 w-12" />
                    <div className="flex-1">
                        <div className="h-3 w-24 bg-white/5 rounded mb-2" />
                        <div className="h-7 w-32 bg-white/5 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
