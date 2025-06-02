import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const getAuthToken = (): string | null => {
    return cookies.get('auth_token') || null;
};

export const setAuthToken = (token: string, maxAge: number = 86400) => {
    cookies.set('auth_token', token, {
        path: '/',
        maxAge,
        secure: process.env.NODE_ENV === 'production',
    });
};

export const removeAuthToken = () => {
    cookies.remove('auth_token', { path: '/' });
};
