import { TradingAccount } from "@/lib/mockData";
import { AccountCard } from "./AccountCard";
import { AccountCardRow } from "./AccountCardRow";

interface DashboardGridProps {
    accounts: TradingAccount[];
    viewMode?: "grid" | "row";
}

export function DashboardGrid({ accounts, viewMode = "grid" }: DashboardGridProps) {
    if (viewMode === "row") {
        return (
            <div className="space-y-4">
                {accounts.map((account) => (
                    <AccountCardRow key={account.id} account={account} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
            ))}
        </div>
    );
}
