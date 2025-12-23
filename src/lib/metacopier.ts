const BASE_URL = "https://api.metacopier.io/rest/api/v1";

export interface MetaCopierAccount {
    _id: string;
    name: string;
    broker: string;
    server: string;
    login: string;
    currency: string;
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    marginLevel: number;
    profit: number; // Open PnL
    type: string; // "DEMO" or "REAL"
    platform: string; // "MT4" or "MT5"
    connectionStatus: string;
}

export interface MetaCopierPosition {
    _id: string;
    symbol: string;
    type: number; // 0=Buy, 1=Sell usually, need to verify
    volume: number;
    openPrice: number;
    currentPrice: number;
    profit: number;
    ticket: number;
}

import fs from 'fs';
import path from 'path';

function getApiKey(): string | undefined {
    // 1. Try process.env
    if (process.env.METACOPIER_API_KEY) {
        const key = process.env.METACOPIER_API_KEY;
        console.log(`Using API Key from process.env: ${key.substring(0, 5)}... (Length: ${key.length})`);
        return key;
    }

    // 2. Try reading .env.local manually (Development fallback)
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/METACOPIER_API_KEY=(.+)/);
            if (match && match[1]) {
                let key = match[1].trim();
                // Remove quotes
                if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
                    key = key.slice(1, -1);
                }
                console.log(`Loaded API Key from .env.local: ${key.substring(0, 5)}...`);
                return key;
            }
        }
    } catch (e) {
        console.warn("Could not read .env.local:", e);
    }
    return undefined;
}

export async function getMetaCopierAccounts() {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.error("METACOPIER_API_KEY is not defined (checked env and .env.local)");
        return [];
    }

    try {
        console.log(`Fetching Accounts from: ${BASE_URL}/accounts`);
        const response = await fetch(`${BASE_URL}/accounts`, {
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            const text = await response.text();
            console.warn(`MetaCopier API request failed: ${response.status} ${response.statusText} - Body: ${text}`);
            return [];
        }

        const data = await response.json();
        const accountsRaw = Array.isArray(data) ? data : (data.accounts || []);

        return accountsRaw.map((item: any) => ({
            _id: item.id,
            name: item.alias,
            broker: item.loginServer ? item.loginServer.split('-')[0] : "Unknown",
            server: item.loginServer,
            login: item.loginAccountNumber,
            currency: item.accountInformation?.currency || "USD",
            balance: item.accountInformation?.balance || 0,
            equity: item.accountInformation?.equity || 0,
            margin: item.accountInformation?.usedMargin || 0,
            freeMargin: item.accountInformation?.freeMargin || 0,
            marginLevel: 0, // Not provided directly
            profit: item.accountInformation?.unrealizedProfit || 0,
            type: "REAL", // Defaulting
            platform: "MT4/5",
            connectionStatus: item.accountInformation?.connected ? "CONNECTED" : "DISCONNECTED"
        }));
    } catch (error) {
        console.error("Error fetching MetaCopier accounts:", error);
        return [];
    }
}

export async function getMetaCopierPositions(accountId: string) {
    const apiKey = getApiKey();

    if (!apiKey) return [];

    try {
        const response = await fetch(`${BASE_URL}/accounts/${accountId}/positions`, {
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) return [];

        const data = await response.json();
        const positionsRaw = Array.isArray(data) ? data : (data.positions || []);

        return positionsRaw.map((pos: any) => ({
            _id: pos.id,
            symbol: pos.symbol,
            type: typeof pos.dealType === 'number' ? pos.dealType : (pos.dealType === 'Buy' ? 0 : 1), // heuristics
            volume: pos.volume,
            openPrice: pos.openPrice,
            currentPrice: pos.openPrice, // API doesn't seem to provide current price in list
            profit: pos.profit,
            ticket: parseInt(pos.id) || 0
        }));
    } catch (error) {
        console.error(`Error fetching positions:`, error);
        return [];
    }
}
