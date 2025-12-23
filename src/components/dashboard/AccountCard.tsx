import { TradingAccount } from "@/lib/mockData";
import { cn, formatNumber } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wifi,
    WifiOff,
    Activity,
    CreditCard,
    Layers
} from "lucide-react";

interface AccountCardProps {
    account: TradingAccount;
}

export function AccountCard({ account }: AccountCardProps) {
    const isConnected = account.status === "Connected";
    const isProfit = account.openPnL >= 0;

    return (
        <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-primary/5">
            {/* Decorative Glow */}
            <div className={cn(
                "absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20",
                isProfit ? "bg-primary" : "bg-destructive"
            )} />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
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

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-px bg-white/5 p-px">
                {/* Balance */}
                <div className="bg-card/50 p-5 group/metric hover:bg-white/[0.02] transition-colors">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
                    <div className="text-xl font-bold text-foreground font-mono">
                        {formatNumber(account.balance, 2)}
                    </div>
                </div>

                {/* Equity */}
                <div className="bg-card/50 p-5 group/metric hover:bg-white/[0.02] transition-colors">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Equity</p>
                    <div className="text-xl font-bold text-foreground font-mono">
                        {formatNumber(account.equity, 2)}
                    </div>
                </div>
            </div>

            {/* PnL Highlight Section */}
            <div className="p-5 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full bg-white/5",
                            isProfit ? "text-primary" : "text-destructive"
                        )}>
                            {isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">Open P/L</span>
                    </div>
                    <div className={cn(
                        "text-2xl font-bold font-mono tracking-tight",
                        isProfit ? "text-primary shadow-glow-primary" : "text-destructive shadow-glow-destructive"
                    )}>
                        {isProfit ? "+" : ""}{formatNumber(account.openPnL, 2)} <span className="text-sm font-sans text-muted-foreground">{account.currency}</span>
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Layers className="h-3 w-3" /> margin Level
                        </div>
                        <div className={cn(
                            "font-mono font-medium",
                            account.marginLevel < 100 ? "text-destructive" : "text-foreground"
                        )}>
                            {account.marginLevel.toFixed(2)}%
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-1">
                            Free Margin
                        </div>
                        <div className="font-mono font-medium text-foreground">
                            {formatNumber(account.freeMargin, 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Positions Section */}
            {account.positions && account.positions.length > 0 && (
                <div className="bg-white/[0.02] border-t border-white/5">
                    <div className="px-5 py-2 flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-foreground">Positions</h4>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <div className="flex gap-0.5">
                                <div className="h-0.5 w-0.5 rounded-full bg-current"></div>
                                <div className="h-0.5 w-0.5 rounded-full bg-current"></div>
                                <div className="h-0.5 w-0.5 rounded-full bg-current"></div>
                            </div>
                        </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {account.positions.map((pos) => (
                            <div key={pos.id} className="px-5 py-3 border-t border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group/row">
                                <div>
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className="font-semibold text-sm text-foreground">{pos.symbol}</span>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-1 rounded-sm",
                                            pos.type === 'buy' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                                        )}>{pos.type}</span>
                                        <span className="text-xs font-mono text-muted-foreground">{pos.volume}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                        {pos.openPrice.toFixed(5)}
                                        <span className="text-zinc-600">→</span>
                                        <span className={cn(
                                            "transition-colors",
                                            pos.pnl >= 0 ? "group-hover/row:text-primary" : "group-hover/row:text-destructive"
                                        )}>{pos.currentPrice.toFixed(5)}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-mono font-bold text-sm",
                                    pos.pnl >= 0 ? "text-primary" : "text-destructive"
                                )}>
                                    {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground">
                <span>Server: {account.server}</span>
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-foreground/70">1:{account.leverage}</span>
            </div>
        </div>
    );
}
