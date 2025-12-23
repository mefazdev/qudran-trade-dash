"use client";

import useSWR from "swr";
import { User } from "@/app/api/user/route";
import { useEffect, useState } from "react";

const defaultUser: User = {
    id: "1",
    name: "User",
    email: "",
    initials: "U",
};

export function useUser() {
    const [userHeaders, setUserHeaders] = useState<HeadersInit>({});

    useEffect(() => {
        // Get user data from localStorage
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

    const { data, error } = useSWR<User>(
        "x-user-email" in userHeaders ? "/api/user" : null,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    if (error) {
        console.error("User fetch error:", error);
        return defaultUser;
    }

    return data || defaultUser;
}
