import { TradingAccount } from "@/lib/mockData";
import { cn, formatNumber } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wifi,
    WifiOff,
    Activity,
    Layers
} from "lucide-react";

interface AccountCardRowProps {
    account: TradingAccount;
}

export function AccountCardRow({ account }: AccountCardRowProps) {
    const isConnected = account.status === "Connected";
    const isProfit = account.openPnL >= 0;

    return (
        <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-primary/5">
            {/* Decorative Glow */}
            <div className={cn(
                "absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20",
                isProfit ? "bg-primary" : "bg-destructive"
            )} />

            <div className="flex">
                {/* Left Column - All Account Details */}
                <div className="flex-1 p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Header - spans full width */}
                        <div className="lg:col-span-2 flex items-center justify-between pb-3 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10",
                                )}>
                                    <Activity className={cn("h-5 w-5", isConnected ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground tracking-tight">{account.name}</h3>
                                    <p className="text-xs text-muted-foreground font-medium">{account.accountNumber} • {account.broker}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset",
                                isConnected
                                    ? "bg-primary/10 text-primary ring-primary/20"
                                    : "bg-destructive/10 text-destructive ring-destructive/20"
                            )}>
                                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                {account.status}
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
                            <div className="text-xl font-bold text-foreground font-mono">
                                {formatNumber(account.balance, 2)}
                            </div>
                        </div>

                        {/* Equity */}
                        <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Equity</p>
                            <div className="text-xl font-bold text-foreground font-mono">
                                {formatNumber(account.equity, 2)}
                            </div>
                        </div>

                        {/* Margin Level */}
                        <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                <Layers className="h-3 w-3" /> Margin Level
                            </div>
                            <div className={cn(
                                "text-xl font-mono font-bold",
                                account.marginLevel < 100 ? "text-destructive" : "text-foreground"
                            )}>
                                {account.marginLevel.toFixed(2)}%
                            </div>
                        </div>

                        {/* Free Margin */}
                        <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Free Margin
                            </div>
                            <div className="text-xl font-mono font-bold text-foreground">
                                {formatNumber(account.freeMargin, 0)}
                            </div>
                        </div>

                        {/* PnL - spans full width */}
                        <div className="lg:col-span-2 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full bg-white/5",
                                    isProfit ? "text-primary" : "text-destructive"
                                )}>
                                    {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">Open P/L</span>
                                <div className={cn(
                                    "text-2xl font-bold font-mono tracking-tight ml-auto",
                                    isProfit ? "text-primary shadow-glow-primary" : "text-destructive shadow-glow-destructive"
                                )}>
                                    {isProfit ? "+" : ""}{formatNumber(account.openPnL, 2)} <span className="text-sm font-sans text-muted-foreground">{account.currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info - spans full width */}
                        <div className="lg:col-span-2 flex justify-between items-center text-[10px] text-muted-foreground pt-3 border-t border-white/5">
                            <span>Server: {account.server}</span>
                            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-foreground/70">1:{account.leverage}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Positions Only */}
                {account.positions && account.positions.length > 0 && (
                    <div className="w-80 lg:w-96 bg-white/[0.02] border-l border-white/5 flex flex-col">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Open Positions</h4>
                            <span className="text-xs font-mono text-muted-foreground">{account.positions.length} {account.positions.length === 1 ? 'position' : 'positions'}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {account.positions.map((pos) => (
                                <div key={pos.id} className="px-5 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors group/pos">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-semibold text-sm text-foreground">{pos.symbol}</span>
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm",
                                                pos.type === 'buy' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                                            )}>{pos.type}</span>
                                        </div>
                                        <div className={cn(
                                            "font-mono font-bold text-sm",
                                            pos.pnl >= 0 ? "text-primary" : "text-destructive"
                                        )}>
                                            {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <div className="text-muted-foreground font-mono flex items-center gap-1">
                                            <span>{pos.openPrice.toFixed(5)}</span>
                                            <span className="text-zinc-600">→</span>
                                            <span className={cn(
                                                "transition-colors font-medium",
                                                pos.pnl >= 0 ? "text-primary/80" : "text-destructive/80"
                                            )}>{pos.currentPrice.toFixed(5)}</span>
                                        </div>
                                        <span className="text-muted-foreground font-mono">{pos.volume} lots</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
