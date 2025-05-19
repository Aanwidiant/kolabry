import { sign } from 'jsonwebtoken';

export const generateToken = (userId: number, username: string, role: string) => {
    return sign(
        { id: userId, username, role },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
    );
};
