import { decodeJwt } from 'jose';

export const decodeToken = (token: string) => {
    try {
        return decodeJwt(token);
    } catch {
        return null;
    }
};
