import Cookies from "universal-cookie";

const cookies = new Cookies();

/**
 * Mengambil token autentikasi dari cookies
 * @returns {string | null} Token atau null jika tidak ada
 */
export const getAuthToken = (): string | null => {
    return cookies.get("auth_token") || null;
};

/**
 * Menyimpan token autentikasi ke cookies
 * @param token Token yang akan disimpan
 * @param maxAge Waktu kadaluarsa dalam detik (default: 1 hari)
 */
export const setAuthToken = (token: string, maxAge: number = 86400) => {
    cookies.set("auth_token", token, {
        path: "/",
        maxAge,
        secure: process.env.NODE_ENV === "production",
    });
};

/**
 * Menghapus token autentikasi dari cookies
 */
export const removeAuthToken = () => {
    cookies.remove("auth_token", { path: "/" });
};
