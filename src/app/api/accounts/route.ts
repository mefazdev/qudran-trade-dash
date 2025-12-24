import { NextRequest, NextResponse } from "next/server";
import { getMetaCopierAccounts, getMetaCopierPositions, MetaCopierAccount, MetaCopierPosition } from "@/lib/metacopier";
import { TradingAccount, AccountStatus } from "@/lib/mockData";
import { getUserByEmail } from "@/lib/users";

export async function GET(request: NextRequest) {
    try {
        // Get user's API key from headers
        const userEmail = request.headers.get("x-user-email");

        let apiKey: string | undefined;

        if (userEmail) {
            const user = getUserByEmail(userEmail);
            if (user) {
                apiKey = user.apiKey;
            }
        }

        const rawAccounts: MetaCopierAccount[] = await getMetaCopierAccounts(apiKey);

        // Fetch positions for all connected accounts in parallel
        const accountsWithPositions = await Promise.all(
            rawAccounts.map(async (acc) => {
                let positions: MetaCopierPosition[] = [];
                if (acc.connectionStatus === "CONNECTED") {
                    positions = await getMetaCopierPositions(acc._id, apiKey);
                }

                return mapToTradingAccount(acc, positions);
            })
        );

        return NextResponse.json(accountsWithPositions);
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

function mapToTradingAccount(acc: MetaCopierAccount, positions: MetaCopierPosition[]): TradingAccount {
    // Map MetaCopier status to our internal AccountStatus
    let status: AccountStatus = "Disconnected";
    if (acc.connectionStatus === "CONNECTED") status = "Connected";
    else if (acc.connectionStatus === "CONNECTING") status = "Pending";

    return {
        id: acc._id,
        name: acc.name,
        broker: acc.broker,
        server: acc.server,
        accountNumber: acc.login,
        currency: acc.currency,
        balance: acc.balance,
        equity: acc.equity,
        margin: acc.margin,
        freeMargin: acc.freeMargin,
        marginLevel: acc.marginLevel,
        openPnL: acc.profit,
        dailyPnL: 0, // MetaCopier might not provide this directly in summary
        status: status,
        leverage: "1:unknown", // Might need details endpoint for this
        positions: positions.map(pos => ({
            id: pos._id || pos.ticket.toString(),
            symbol: pos.symbol,
            type: pos.type === 0 ? "buy" : "sell", // Assuming 0=Buy, 1=Sell for MT4/5 standard
            volume: pos.volume,
            openPrice: pos.openPrice,
            currentPrice: pos.currentPrice,
            pnl: pos.profit
        }))
    };
}
