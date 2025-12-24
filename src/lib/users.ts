export interface UserData {
    id: string;
    name: string;
    email: string;
    password: string;
    apiKey: string;
}

// User database with credentials and API keys
export const USERS: UserData[] = [
    {
        id: "1",
        name: "Shuhaib",
        email: "shuaibrec@gmail.com",
        password: "Shuhaib@123",
        apiKey: "vVlopT9/8apfylncvbd(ulGoaPXtCEv?",
    },
    {
        id: "2",
        name: "Ibrahim",
        email: "ibrahimvtc@gmail.com",
        password: "Ibrahim@9631",
        apiKey: "1s5Ta5yWIJYBe9TaPOKBcNdMBX)Ez9r@",
    },
];

export function validateUser(email: string, password: string): UserData | null {
    const user = USERS.find(
        (u) => u.email === email && u.password === password
    );
    return user || null;
}

export function getUserByEmail(email: string): UserData | null {
    return USERS.find((u) => u.email === email) || null;
}
