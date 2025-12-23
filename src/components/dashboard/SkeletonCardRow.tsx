export function SkeletonCardRow() {
    return (
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-card/50 backdrop-blur-md">
            <div className="animate-pulse flex">
                {/* Left Column - Details */}
                <div className="flex-1 p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Header */}
                        <div className="lg:col-span-2 flex items-center justify-between pb-3 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/5" />
                                <div>
                                    <div className="h-4 w-32 bg-white/5 rounded mb-2" />
                                    <div className="h-3 w-40 bg-white/5 rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-20 bg-white/5 rounded-full" />
                        </div>

                        {/* Metrics - 4 boxes */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                                <div className="h-3 w-20 bg-white/5 rounded mb-2" />
                                <div className="h-6 w-28 bg-white/5 rounded" />
                            </div>
                        ))}

                        {/* PnL */}
                        <div className="lg:col-span-2 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-white/5" />
                                <div className="h-4 w-20 bg-white/5 rounded" />
                                <div className="h-8 w-40 bg-white/5 rounded ml-auto" />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="lg:col-span-2 flex justify-between items-center pt-3 border-t border-white/5">
                            <div className="h-3 w-32 bg-white/5 rounded" />
                            <div className="h-4 w-16 bg-white/5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Right Column - Positions */}
                <div className="w-80 lg:w-96 bg-white/[0.02] border-l border-white/5">
                    <div className="px-5 py-4 border-b border-white/5">
                        <div className="h-4 w-32 bg-white/5 rounded" />
                    </div>
                    <div className="space-y-3 p-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-24 bg-white/5 rounded" />
                                    <div className="h-4 w-16 bg-white/5 rounded" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-3 w-32 bg-white/5 rounded" />
                                    <div className="h-3 w-20 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
