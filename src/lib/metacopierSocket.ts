"use client";

import { Client, StompSubscription } from '@stomp/stompjs';

// Types based on MetaCopier Socket API documentation
export interface UpdateAccountInformationDTO {
    accountId: string;
    balance?: number;
    equity?: number;
    margin?: number;
    freeMargin?: number;
    marginLevel?: number;
    unrealizedProfit?: number;
    leverage?: number;
    connected?: boolean;
}

export interface UpdateOpenPositionsDTO {
    accountId: string;
    positions: SocketPosition[];
}

export interface UpdateHistoryDTO {
    accountId: string;
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
    payload: UpdateAccountInformationDTO | UpdateOpenPositionsDTO | UpdateHistoryDTO;
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

    constructor(private apiKey: string) {}

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
                this.subscribe();
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
                const data: MessageWrapper = JSON.parse(message.body);
                console.log('[MetaCopier WS] Received update:', data.type);

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

        console.log('[MetaCopier WS] Subscribed to /user/queue/accounts/changes');
    }

    onUpdate(callback: SocketUpdateCallback): () => void {
        this.callbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks.delete(callback);
        };
    }

    disconnect() {
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

    isConnected(): boolean {
        return this.client?.connected || false;
    }
}

// Singleton instance
let socketClient: MetaCopierSocketClient | null = null;

export function getSocketClient(apiKey: string): MetaCopierSocketClient {
    if (!socketClient) {
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
