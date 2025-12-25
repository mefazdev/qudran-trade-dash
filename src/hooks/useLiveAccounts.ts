"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { TradingAccount, Position } from "@/lib/mockData";
import {
    getSocketClient,
    MessageWrapper,
    UpdateAccountInformationDTO,
    UpdateOpenPositionsDTO,
    UpdateHistoryDTO,
    disconnectSocket
} from "@/lib/metacopierSocket";

export function useLiveAccounts() {
    const [userHeaders, setUserHeaders] = useState<HeadersInit>({});
    const [liveAccounts, setLiveAccounts] = useState<TradingAccount[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketConnected = useRef(false);

    // Get user headers from localStorage
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const name = localStorage.getItem("userName");

        if (email) {
            setUserHeaders({
                "x-user-email": email,
                "x-user-name": name || "User",
            });
        }
    }, []);

    const fetcher = (url: string) =>
        fetch(url, {
            headers: userHeaders,
        }).then((res) => res.json());

    const { data, error, isLoading, isValidating, mutate } = useSWR<TradingAccount[]>(
        Object.keys(userHeaders).length > 0 ? "/api/accounts" : null,
        fetcher,
        {
            refreshInterval: 10000, // Increased to 10s since we have WebSocket for real-time updates
            revalidateOnFocus: false,
        }
    );

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

        // Get API key from localStorage (user-specific)
        const apiKey = localStorage.getItem("userApiKey");

        if (!apiKey) {
            console.warn('[useLiveAccounts] No user API key found in localStorage. WebSocket disabled.');
            return;
        }

        if (socketConnected.current) {
            return; // Already connected
        }

        let unsubscribe: (() => void) | null = null;
        let isMounted = true;

        const socketClient = getSocketClient(apiKey);

        // Connect to WebSocket
        socketClient.connect().then(() => {
            if (!isMounted) {
                console.log('[useLiveAccounts] Component unmounted during connection, skipping subscription');
                return;
            }

            console.log('[useLiveAccounts] WebSocket connected successfully');
            socketConnected.current = true;
            setIsConnected(true);

            // Subscribe to updates
            unsubscribe = socketClient.onUpdate((message: MessageWrapper) => {
                if (isMounted) {
                    handleSocketUpdate(message);
                }
            });

            // Subscribe to all account IDs to start receiving updates
            const accountIds = data.map(acc => acc.id);
            if (accountIds.length > 0) {
                console.log('[useLiveAccounts] Subscribing to accounts:', accountIds);
                socketClient.subscribeToAccounts(accountIds);
            }
        }).catch((error) => {
            console.error('[useLiveAccounts] WebSocket connection failed:', error);
            console.log('[useLiveAccounts] Falling back to REST API polling only');
            socketConnected.current = false;
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            isMounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
            if (socketConnected.current) {
                disconnectSocket();
                socketConnected.current = false;
                setIsConnected(false);
            }
        };
    }, [data]);

    const handleSocketUpdate = (message: MessageWrapper) => {
        console.log('[useLiveAccounts] Processing message:', JSON.stringify(message, null, 2));

        // Handle history updates outside setState to avoid React warning
        if (message.type === 'UpdateHistoryDTO') {
            const payload = (message.data || message.payload) as UpdateHistoryDTO;
            console.log('[useLiveAccounts] Received history update for account:', payload.accountId || payload.id);
            console.log('[useLiveAccounts] History items:', payload.history?.length || 0);
            console.log('[useLiveAccounts] Trade closed - requesting account refresh');

            // Refresh account data from API since balance changed
            mutate();
            return;
        }

        setLiveAccounts((prevAccounts) => {
            const updatedAccounts = [...prevAccounts];

            switch (message.type) {
                case 'UpdateAccountInformationDTO': {
                    // Support both 'data' and 'payload' fields
                    const payload = (message.data || message.payload) as UpdateAccountInformationDTO;
                    console.log('[useLiveAccounts] Account info payload:', payload);

                    // Support both 'id' and 'accountId' field names
                    const accountId = payload.id || payload.accountId;
                    if (!accountId) {
                        console.warn('[useLiveAccounts] No account ID found in payload:', payload);
                        break;
                    }

                    const accountIndex = updatedAccounts.findIndex(acc => acc.id === accountId);

                    if (accountIndex !== -1) {
                        const account = updatedAccounts[accountIndex];

                        // Extract values from nested accountInformation or top-level
                        const info = payload.accountInformation || payload;

                        updatedAccounts[accountIndex] = {
                            ...account,
                            balance: info.balance ?? account.balance,
                            equity: info.equity ?? account.equity,
                            margin: info.usedMargin ?? info.margin ?? account.margin,
                            freeMargin: info.freeMargin ?? account.freeMargin,
                            marginLevel: info.marginLevel ?? account.marginLevel,
                            openPnL: info.unrealizedProfit ?? account.openPnL,
                            status: info.connected === false ? 'Disconnected' : 'Connected',
                        };
                        console.log('[useLiveAccounts] Updated account:', updatedAccounts[accountIndex]);
                    } else {
                        console.warn('[useLiveAccounts] Account not found:', accountId);
                    }
                    break;
                }

                case 'UpdateOpenPositionsDTO': {
                    // Support both 'data' and 'payload' fields
                    const payload = (message.data || message.payload) as any;
                    console.log('[useLiveAccounts] Positions payload:', payload);
                    console.log('[useLiveAccounts] Positions payload keys:', Object.keys(payload));

                    // Support both 'id' and 'accountId' field names
                    const accountId = payload.id || payload.accountId;
                    if (!accountId) {
                        console.warn('[useLiveAccounts] No account ID found in positions payload:', payload);
                        break;
                    }

                    // Check if positions array exists - may be under different field names
                    const positionsArray = payload.positions || payload.openPositions || payload.items || [];
                    if (!Array.isArray(positionsArray)) {
                        console.warn('[useLiveAccounts] No positions array found in payload. Keys:', Object.keys(payload));
                        break;
                    }

                    console.log('[useLiveAccounts] Found', positionsArray.length, 'positions');

                    const accountIndex = updatedAccounts.findIndex(acc => acc.id === accountId);

                    if (accountIndex !== -1) {
                        const account = updatedAccounts[accountIndex];
                        const positions: Position[] = positionsArray.map((pos: any) => {
                            // Handle different type field formats
                            const typeStr = (pos.type || pos.dealType || pos.orderType || '').toLowerCase();
                            const isBuy = typeStr.includes('buy');

                            return {
                                id: pos.id || pos._id || '',
                                symbol: pos.symbol || '',
                                type: isBuy ? 'buy' as const : 'sell' as const,
                                volume: pos.volume || 0,
                                openPrice: pos.openPrice || 0,
                                currentPrice: pos.currentPrice || pos.openPrice || 0,
                                pnl: pos.profit || pos.netProfit || 0,
                            };
                        });

                        updatedAccounts[accountIndex] = {
                            ...account,
                            positions,
                        };
                        console.log('[useLiveAccounts] Updated positions for account:', accountId, positions);
                    } else {
                        console.warn('[useLiveAccounts] Account not found for positions update:', accountId);
                    }
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
        isSocketConnected: isConnected
    };
}
