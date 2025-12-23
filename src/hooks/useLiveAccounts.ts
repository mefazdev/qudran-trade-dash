"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { TradingAccount, Position } from "@/lib/mockData";
import {
    getSocketClient,
    MessageWrapper,
    UpdateAccountInformationDTO,
    UpdateOpenPositionsDTO,
    disconnectSocket
} from "@/lib/metacopierSocket";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLiveAccounts() {
    const { data, error, isLoading, isValidating, mutate } = useSWR<TradingAccount[]>("/api/accounts", fetcher, {
        refreshInterval: 10000, // Increased to 10s since we have WebSocket for real-time updates
        revalidateOnFocus: false,
    });

    const [liveAccounts, setLiveAccounts] = useState<TradingAccount[]>([]);
    const socketConnected = useRef(false);

    // Update liveAccounts whenever REST API data changes
    useEffect(() => {
        if (data) {
            setLiveAccounts(data);
        }
    }, [data]);

    // WebSocket connection and updates
    useEffect(() => {
        // Only try to connect if we have initial data
        if (!data || data.length === 0) {
            return;
        }

        // Get API key from environment (client-side)
        const apiKey = process.env.NEXT_PUBLIC_METACOPIER_API_KEY;

        if (!apiKey) {
            console.warn('[useLiveAccounts] No NEXT_PUBLIC_METACOPIER_API_KEY found. WebSocket disabled.');
            return;
        }

        if (socketConnected.current) {
            return; // Already connected
        }

        const socketClient = getSocketClient(apiKey);

        // Connect to WebSocket
        socketClient.connect().then(() => {
            console.log('[useLiveAccounts] WebSocket connected successfully');
            socketConnected.current = true;

            // Subscribe to updates
            const unsubscribe = socketClient.onUpdate((message: MessageWrapper) => {
                handleSocketUpdate(message);
            });

            // Cleanup on unmount
            return () => {
                unsubscribe();
            };
        }).catch((error) => {
            console.error('[useLiveAccounts] WebSocket connection failed:', error);
            console.log('[useLiveAccounts] Falling back to REST API polling only');
        });

        // Cleanup on unmount
        return () => {
            if (socketConnected.current) {
                disconnectSocket();
                socketConnected.current = false;
            }
        };
    }, [data]);

    const handleSocketUpdate = (message: MessageWrapper) => {
        setLiveAccounts((prevAccounts) => {
            const updatedAccounts = [...prevAccounts];

            switch (message.type) {
                case 'UpdateAccountInformationDTO': {
                    const payload = message.payload as UpdateAccountInformationDTO;
                    const accountIndex = updatedAccounts.findIndex(acc => acc.id === payload.accountId);

                    if (accountIndex !== -1) {
                        const account = updatedAccounts[accountIndex];
                        updatedAccounts[accountIndex] = {
                            ...account,
                            balance: payload.balance ?? account.balance,
                            equity: payload.equity ?? account.equity,
                            margin: payload.margin ?? account.margin,
                            freeMargin: payload.freeMargin ?? account.freeMargin,
                            marginLevel: payload.marginLevel ?? account.marginLevel,
                            openPnL: payload.unrealizedProfit ?? account.openPnL,
                            status: payload.connected === false ? 'Disconnected' : 'Connected',
                        };
                    }
                    break;
                }

                case 'UpdateOpenPositionsDTO': {
                    const payload = message.payload as UpdateOpenPositionsDTO;
                    const accountIndex = updatedAccounts.findIndex(acc => acc.id === payload.accountId);

                    if (accountIndex !== -1) {
                        const account = updatedAccounts[accountIndex];
                        const positions: Position[] = payload.positions.map(pos => ({
                            id: pos.id,
                            symbol: pos.symbol,
                            type: pos.type.toLowerCase().includes('buy') ? 'buy' : 'sell',
                            volume: pos.volume,
                            openPrice: pos.openPrice,
                            currentPrice: pos.currentPrice,
                            pnl: pos.profit,
                        }));

                        updatedAccounts[accountIndex] = {
                            ...account,
                            positions,
                        };
                    }
                    break;
                }

                case 'UpdateHistoryDTO': {
                    // History updates don't need to change account state for now
                    // Could be used for calculating daily P&L if needed
                    console.log('[useLiveAccounts] Received history update');
                    break;
                }

                default:
                    console.warn('[useLiveAccounts] Unknown message type:', message.type);
            }

            return updatedAccounts;
        });
    };

    // Return loading state and data
    return {
        accounts: liveAccounts,
        isLoading: isLoading && !data,
        isError: !!error,
        isValidating,
    };
}
