import { TradingAccount } from "@/lib/mockData";
import { Wallet, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SummaryRibbonProps {
    accounts: TradingAccount[];
}

export function SummaryRibbon({ accounts }: SummaryRibbonProps) {
    const totalEquity = accounts.reduce((sum, acc) => sum + acc.equity, 0);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalPnL = accounts.reduce((sum, acc) => sum + acc.openPnL, 0);

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card/30 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="flex-1 p-4 rounded-lg bg-card/40 flex items-center gap-4 border border-white/5">
                <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                    <Wallet className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Equity</p>
                    <p className="text-2xl font-bold font-mono text-foreground">${formatNumber(totalEquity, 0)}</p>
                </div>
            </div>

            <div className="flex-1 p-4 rounded-lg bg-card/40 flex items-center gap-4 border border-white/5">
                <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                    <Wallet className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Balance</p>
                    <p className="text-2xl font-bold font-mono text-foreground">${formatNumber(totalBalance, 0)}</p>
                </div>
            </div>

            <div className="flex-1 p-4 rounded-lg bg-card/40 flex items-center gap-4 border border-white/5">
                <div className={`p-3 rounded-full ${totalPnL >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total P/L</p>
                    <p className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-primary" : "text-destructive"}`}>
                        {totalPnL >= 0 ? "+" : ""}{formatNumber(totalPnL, 2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
