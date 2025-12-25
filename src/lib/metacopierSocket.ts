"use client";

import { Client, StompSubscription } from '@stomp/stompjs';

// Types based on MetaCopier Socket API documentation
export interface UpdateAccountInformationDTO {
    id?: string; // Account ID
    accountId?: string; // Alternative field name
    balance?: number;
    equity?: number;
    margin?: number;
    usedMargin?: number;
    freeMargin?: number;
    marginLevel?: number;
    unrealizedProfit?: number;
    leverage?: number;
    connected?: boolean;
    accountInformation?: {
        balance?: number;
        equity?: number;
        margin?: number;
        usedMargin?: number;
        freeMargin?: number;
        marginLevel?: number;
        unrealizedProfit?: number;
        connected?: boolean;
    };
}

export interface UpdateOpenPositionsDTO {
    id?: string; // Account ID
    accountId?: string; // Alternative field name
    positions: SocketPosition[];
}

export interface UpdateHistoryDTO {
    id?: string; // Account ID
    accountId?: string; // Alternative field name
    history: SocketHistoryItem[];
}

export interface SocketPosition {
    id: string;
    symbol: string;
    type: string; // "DealBuy" or "DealSell"
    volume: number;
    openPrice: number;
    currentPrice: number;
    profit: number;
}

export interface SocketHistoryItem {
    id: string;
    symbol: string;
    type: string;
    volume: number;
    openPrice: number;
    closePrice: number;
    profit: number;
    closeTime: string;
}

export interface MessageWrapper {
    type: 'UpdateAccountInformationDTO' | 'UpdateOpenPositionsDTO' | 'UpdateHistoryDTO';
    data: UpdateAccountInformationDTO | UpdateOpenPositionsDTO | UpdateHistoryDTO;
    payload?: UpdateAccountInformationDTO | UpdateOpenPositionsDTO | UpdateHistoryDTO; // Legacy support
}

export type SocketUpdateCallback = (message: MessageWrapper) => void;

class MetaCopierSocketClient {
    private client: Client | null = null;
    private subscription: StompSubscription | null = null;
    private callbacks: Set<SocketUpdateCallback> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private isConnecting = false;
    private lastMessageTime: number = Date.now();
    private heartbeatCheckInterval: NodeJS.Timeout | null = null;

    constructor(private apiKey: string) {
        console.log('[MetaCopier WS] Client initialized');
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                console.log('[MetaCopier WS] Already connected');
                resolve();
                return;
            }

            if (this.isConnecting) {
                console.log('[MetaCopier WS] Connection already in progress');
                return;
            }

            this.isConnecting = true;

            this.client = new Client({
                brokerURL: 'wss://api.metacopier.io/ws/api/v1',
                connectHeaders: {
                    'api-key': this.apiKey,
                },
                debug: (str) => {
                    console.log('[MetaCopier WS Debug]', str);
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.client.onConnect = (frame) => {
                console.log('[MetaCopier WS] Connected successfully', frame);
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.lastMessageTime = Date.now();
                this.subscribe();
                this.startHeartbeatCheck();
                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('[MetaCopier WS] STOMP Error:', frame.headers['message']);
                console.error('[MetaCopier WS] Error details:', frame.body);
                this.isConnecting = false;
                reject(new Error(frame.headers['message'] || 'STOMP connection error'));
            };

            this.client.onWebSocketError = (event) => {
                console.error('[MetaCopier WS] WebSocket Error:', event);
                this.isConnecting = false;
            };

            this.client.onDisconnect = () => {
                console.log('[MetaCopier WS] Disconnected');
                this.isConnecting = false;
            };

            this.client.activate();
        });
    }

    private subscribe() {
        if (!this.client?.connected) {
            console.warn('[MetaCopier WS] Cannot subscribe - not connected');
            return;
        }

        this.subscription = this.client.subscribe('/user/queue/accounts/changes', (message) => {
            try {
                this.lastMessageTime = Date.now();
                console.log('[MetaCopier WS] Raw message body:', message.body);
                const rawData = JSON.parse(message.body);
                console.log('[MetaCopier WS] Parsed raw data:', rawData);

                // MetaCopier uses 'data' field, not 'payload'
                let data: MessageWrapper;

                if (rawData.type && rawData.data) {
                    // MetaCopier format: {type: "...", data: {...}}
                    data = {
                        type: rawData.type,
                        data: rawData.data,
                        payload: rawData.data // Also set payload for backwards compatibility
                    };
                } else if (rawData.type && rawData.payload) {
                    // Alternative format with payload
                    data = rawData as MessageWrapper;
                } else {
                    // Infer type from the data structure (fallback)
                    if (rawData.accountInformation !== undefined || rawData.balance !== undefined) {
                        data = {
                            type: 'UpdateAccountInformationDTO',
                            data: rawData,
                            payload: rawData
                        };
                    } else if (rawData.positions !== undefined) {
                        data = {
                            type: 'UpdateOpenPositionsDTO',
                            data: rawData,
                            payload: rawData
                        };
                    } else if (rawData.history !== undefined) {
                        data = {
                            type: 'UpdateHistoryDTO',
                            data: rawData,
                            payload: rawData
                        };
                    } else {
                        console.warn('[MetaCopier WS] Unknown message format:', rawData);
                        return;
                    }
                }

                console.log('[MetaCopier WS] Wrapped message:', data);
                console.log('[MetaCopier WS] Received update:', data.type, 'at', new Date().toISOString());

                // Notify all registered callbacks
                this.callbacks.forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error('[MetaCopier WS] Error in callback:', error);
                    }
                });
            } catch (error) {
                console.error('[MetaCopier WS] Error parsing message:', error);
            }
        });

        console.log('[MetaCopier WS] Subscribed to /user/queue/accounts/changes at', new Date().toISOString());
    }

    subscribeToAccounts(accountIds: string[]) {
        if (!this.client?.connected) {
            console.warn('[MetaCopier WS] Cannot subscribe to accounts - not connected');
            return;
        }

        console.log('[MetaCopier WS] Requesting streaming for accounts:', accountIds);

        // Try multiple subscription methods based on MetaCopier documentation patterns
        try {
            // Method 1: Subscribe via /app/subscribe
            this.client.publish({
                destination: '/app/subscribe',
                body: JSON.stringify({
                    accountIds: accountIds
                })
            });
            console.log('[MetaCopier WS] Sent subscription via /app/subscribe');

        } catch (error) {
            console.error('[MetaCopier WS] Failed to subscribe to accounts:', error);
        }
    }

    private startHeartbeatCheck() {
        // Clear existing interval if any
        if (this.heartbeatCheckInterval) {
            clearInterval(this.heartbeatCheckInterval);
        }

        // Check connection health every 30 seconds
        this.heartbeatCheckInterval = setInterval(() => {
            const timeSinceLastMessage = Date.now() - this.lastMessageTime;
            const isStale = timeSinceLastMessage > 60000; // 60 seconds without any message

            if (this.client?.connected) {
                console.log('[MetaCopier WS] Connection health check - Connected:',
                    this.client.connected,
                    'Time since last message:',
                    Math.round(timeSinceLastMessage / 1000) + 's',
                    isStale ? '(STALE!)' : '(OK)');
            } else {
                console.warn('[MetaCopier WS] Connection health check - DISCONNECTED!');
            }
        }, 30000);
    }

    onUpdate(callback: SocketUpdateCallback): () => void {
        this.callbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks.delete(callback);
        };
    }

    disconnect() {
        if (this.heartbeatCheckInterval) {
            clearInterval(this.heartbeatCheckInterval);
            this.heartbeatCheckInterval = null;
        }

        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }

        this.callbacks.clear();
        this.isConnecting = false;
        console.log('[MetaCopier WS] Disconnected and cleaned up');
    }

    getApiKey(): string {
        return this.apiKey;
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }

    destroy() {
        this.disconnect();
    }
}

// Singleton instance
let socketClient: MetaCopierSocketClient | null = null;

export function getSocketClient(apiKey: string): MetaCopierSocketClient {
    if (!socketClient || socketClient.getApiKey() !== apiKey) {
        if (socketClient) {
            console.log('[MetaCopier WS] API Key changed, recreating client');
            socketClient.destroy();
        }
        socketClient = new MetaCopierSocketClient(apiKey);
    }
    return socketClient;
}

export function disconnectSocket() {
    if (socketClient) {
        socketClient.disconnect();
        socketClient = null;
    }
}
