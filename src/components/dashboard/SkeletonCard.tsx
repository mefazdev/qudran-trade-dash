export function SkeletonCard() {
    return (
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-card/50 backdrop-blur-md">
            <div className="animate-pulse">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/5" />
                        <div>
                            <div className="h-4 w-32 bg-white/5 rounded mb-2" />
                            <div className="h-3 w-40 bg-white/5 rounded" />
                        </div>
                    </div>
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5 p-px">
                    <div className="bg-card/50 p-5">
                        <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                        <div className="h-6 w-24 bg-white/5 rounded" />
                    </div>
                    <div className="bg-card/50 p-5">
                        <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                        <div className="h-6 w-24 bg-white/5 rounded" />
                    </div>
                </div>

                {/* PnL Section */}
                <div className="p-5 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-white/5" />
                            <div className="h-4 w-20 bg-white/5 rounded" />
                        </div>
                        <div className="h-8 w-32 bg-white/5 rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <div className="h-3 w-24 bg-white/5 rounded mb-1" />
                            <div className="h-5 w-16 bg-white/5 rounded" />
                        </div>
                        <div className="text-right">
                            <div className="h-3 w-24 bg-white/5 rounded mb-1 ml-auto" />
                            <div className="h-5 w-16 bg-white/5 rounded ml-auto" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                    <div className="h-3 w-24 bg-white/5 rounded" />
                    <div className="h-4 w-12 bg-white/5 rounded" />
                </div>
            </div>
        </div>
    );
}
