export type AccountStatus = "Connected" | "Disconnected" | "Pending";

export interface Position {
    id: string;
    symbol: string;
    type: "buy" | "sell";
    volume: number;
    openPrice: number;
    currentPrice: number;
    pnl: number;
}

export interface TradingAccount {
    id: string;
    name: string;
    broker: string;
    server: string;
    accountNumber: string;
    currency: string;
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    marginLevel: number; // percentage
    openPnL: number;
    dailyPnL: number;
    status: AccountStatus;
    leverage: string;
    positions: Position[];
}

export const mockAccounts: TradingAccount[] = [
    {
        id: "1",
        name: "Main Scalping",
        broker: "IC Markets",
        server: "ICMarkets-Live21",
        accountNumber: "21098345",
        currency: "USD",
        balance: 50000.00,
        equity: 51240.50,
        margin: 2500.00,
        freeMargin: 48740.50,
        marginLevel: 2049.62,
        openPnL: 1240.50,
        dailyPnL: 350.20,
        status: "Connected",
        leverage: "1:500",
        positions: [
            { id: "p1", symbol: "EURUSD", type: "buy", volume: 1.0, openPrice: 1.0850, currentPrice: 1.0862, pnl: 120.00 },
            { id: "p2", symbol: "GBPUSD", type: "sell", volume: 0.5, openPrice: 1.2700, currentPrice: 1.2680, pnl: 100.00 },
            { id: "p3", symbol: "XAUUSD", type: "buy", volume: 0.1, openPrice: 2030.50, currentPrice: 2040.70, pnl: 102.00 },
        ]
    },
    {
        id: "2",
        name: "Swing Strategy",
        broker: "Exness",
        server: "Exness-Real5",
        accountNumber: "9982134",
        currency: "USD",
        balance: 10000.00,
        equity: 9850.20,
        margin: 1200.00,
        freeMargin: 8650.20,
        marginLevel: 820.85,
        openPnL: -149.80,
        dailyPnL: -50.00,
        status: "Connected",
        leverage: "1:200",
        positions: [
            { id: "p4", symbol: "US30", type: "sell", volume: 0.2, openPrice: 38500, currentPrice: 38550, pnl: -100.00 },
            { id: "p5", symbol: "NAS100", type: "sell", volume: 0.1, openPrice: 17800, currentPrice: 17825, pnl: -49.80 },
        ]
    },
    {
        id: "3",
        name: "Copy Master",
        broker: "Pepperstone",
        server: "Pepperstone-Edge03",
        accountNumber: "77223311",
        currency: "EUR",
        balance: 25000.00,
        equity: 26500.00,
        margin: 5000.00,
        freeMargin: 21500.00,
        marginLevel: 530.00,
        openPnL: 1500.00,
        dailyPnL: 890.15,
        status: "Connected",
        leverage: "1:100",
        positions: [
            { id: "p6", symbol: "EURJPY", type: "buy", volume: 2.0, openPrice: 162.50, currentPrice: 163.00, pnl: 1000.00 },
            { id: "p7", symbol: "USDJPY", type: "buy", volume: 1.0, openPrice: 149.50, currentPrice: 150.00, pnl: 500.00 },
        ]
    },
    {
        id: "4",
        name: "High Risker",
        broker: "RoboForex",
        server: "RoboForex-Pro",
        accountNumber: "11223344",
        currency: "USD",
        balance: 5000.00,
        equity: 2100.00,
        margin: 1800.00,
        freeMargin: 300.00,
        marginLevel: 116.67,
        openPnL: -2900.00,
        dailyPnL: -1200.00,
        status: "Connected",
        leverage: "1:1000",
        positions: [
            { id: "p8", symbol: "XAUUSD", type: "sell", volume: 0.5, openPrice: 2000.00, currentPrice: 2058.00, pnl: -2900.00 },
        ]
    },
    {
        id: "5",
        name: "Funded Account",
        broker: "FTMO",
        server: "FTMO-Demo",
        accountNumber: "88990011",
        currency: "USD",
        balance: 100000.00,
        equity: 100000.00,
        margin: 0.00,
        freeMargin: 100000.00,
        marginLevel: 0,
        openPnL: 0.00,
        dailyPnL: 0.00,
        status: "Disconnected",
        leverage: "1:100",
        positions: []
    },
];
