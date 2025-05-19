import { verify } from 'jsonwebtoken';

export const decodeToken = (token: string) => {
    try {
        return verify(token, process.env.JWT_SECRET!);
    } catch {
        return null;
    }
};
