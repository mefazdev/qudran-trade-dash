import { NextResponse } from "next/server";

export interface User {
    id: string;
    name: string;
    email: string;
    initials: string;
    avatar?: string;
}

export async function GET(request: Request) {
    try {
        // Get user info from request headers (sent from client)
        const userEmail = request.headers.get("x-user-email");
        const userName = request.headers.get("x-user-name");

        if (!userEmail) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Generate initials from name
        const getInitials = (name: string | null): string => {
            if (!name) return "U";
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        };

        const user: User = {
            id: "1",
            name: userName || "User",
            email: userEmail,
            initials: getInitials(userName),
        };

        return NextResponse.json(user);
    } catch (error) {
        console.error("User API Error:", error);
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}
