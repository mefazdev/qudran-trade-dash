"use client";

import useSWR from "swr";
import { TradingAccount } from "@/lib/mockData";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLiveAccounts() {
    const { data, error, isLoading, isValidating } = useSWR<TradingAccount[]>("/api/accounts", fetcher, {
        refreshInterval: 3000,
        revalidateOnFocus: false,
    });

    // Return loading state and data
    return {
        accounts: data || [],
        isLoading: isLoading && !data,
        isError: !!error,
        isValidating,
    };
}
