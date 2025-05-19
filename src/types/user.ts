export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
}

export type UserRole =
    | "ADMIN"
    | "KOL_MANAGER"
    | "BRAND";