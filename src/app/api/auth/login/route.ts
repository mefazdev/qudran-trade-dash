import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "@/lib/users";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            );
        }

        const user = validateUser(email, password);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Return user data without password
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                apiKey: user.apiKey,
            },
        });
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json(
            { success: false, error: "An error occurred during login" },
            { status: 500 }
        );
    }
}
