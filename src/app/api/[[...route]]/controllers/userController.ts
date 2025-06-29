import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';
import { Pagination, generateToken, validatePassword, validateEmail } from '../helpers';

// Create User
export const createUser = async (c: Context) => {
    const { username, email, password, role } = await c.req.json();

    if (!username || !email || !password || !role) {
        return c.json(
            {
                success: false,
                message: 'All fields must be filled, including role',
            },
            400
        );
    }

    const existingEmail = await prisma.users.findUnique({
        where: { email },
    });

    if (existingEmail) {
        return c.json(
            {
                success: false,
                message: 'Email is already registered.',
            },
            400
        );
    }

    const existingUsername = await prisma.users.findUnique({
        where: { username },
    });

    if (existingUsername) {
        return c.json(
            {
                success: false,
                message: 'Username is already taken.',
            },
            400
        );
    }

    const emailError = validateEmail(email);
    if (emailError) {
        return c.json({ success: false, message: emailError }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return c.json(
            {
                success: false,
                message: passwordError,
            },
            400
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.users.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
        });

        return c.json(
            {
                success: true,
                message: `User ${user.username} created successfully.`,
            },
            201
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed create user',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Get User List
export const getUsers = async (c: Context) => {
    const { search = '', page = '1', limit = '10', role, noPagination = 'false' } = c.req.query();

    const usePagination = noPagination !== 'true';

    const pageNumber = usePagination ? parseInt(page, 10) : 1;
    const limitNumber = usePagination ? Math.max(parseInt(limit, 10), 1) : undefined;
    const offset = usePagination ? (pageNumber - 1) * limitNumber! : undefined;

    if (usePagination && (isNaN(pageNumber) || isNaN(limitNumber!))) {
        return c.json(
            {
                success: false,
                message: 'Invalid page or limit number.',
            },
            400
        );
    }

    const isValidRole = (value: string): value is UserRole => Object.values(UserRole).includes(value as UserRole);

    const filters: Prisma.usersWhereInput = {
        ...(role && isValidRole(role) ? { role: role as UserRole } : {}),
        ...(search
            ? {
                  OR: [
                      { username: { contains: search, mode: 'insensitive' } },
                      { email: { contains: search, mode: 'insensitive' } },
                  ],
              }
            : {}),
    };

    try {
        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
                where: filters,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    created_at: true,
                },
                ...(usePagination ? { skip: offset, take: limitNumber } : {}),
                orderBy: { created_at: 'desc' },
            }),
            prisma.users.count({ where: filters }),
        ]);

        return c.json({
            success: true,
            data: users,
            ...(usePagination
                ? {
                      pagination: Pagination({
                          page: pageNumber,
                          limit: limitNumber!,
                          total: totalUsers,
                      }),
                  }
                : { total: totalUsers }),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to get users data.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Update User
export const updateUser = async (c: Context) => {
    const id = parseInt(c.req.param('id'));
    const { username, email, role, password } = await c.req.json();
    const user = c.get('user');

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'User ID is required.',
            },
            400
        );
    }

    if (user.id !== id && user.role !== 'ADMIN' && role) {
        return c.json(
            {
                success: false,
                message: 'You are not allowed to change roles',
            },
            403
        );
    }

    const updateData: Prisma.usersUpdateInput = {};

    const oldValue = await prisma.users.findUnique({
        where: { id },
    });
    if (!oldValue) {
        return c.json({ success: false, message: 'User not found.' }, 404);
    }

    if (username !== undefined && username !== oldValue.username) {
        const existingUsername = await prisma.users.findUnique({
            where: { username },
        });

        if (existingUsername && existingUsername.id !== oldValue.id) {
            return c.json(
                {
                    success: false,
                    message: 'Username is already taken.',
                },
                400
            );
        }

        updateData.username = username;
    }

    if (email !== undefined && email !== oldValue.email) {
        const emailError = validateEmail(email);
        if (emailError) {
            return c.json({ success: false, message: emailError }, 400);
        }

        const existingEmail = await prisma.users.findUnique({
            where: { email },
        });

        if (existingEmail && existingEmail.id !== oldValue.id) {
            return c.json(
                {
                    success: false,
                    message: 'Email is already registered.',
                },
                400
            );
        }

        updateData.email = email;
    }

    if (role !== undefined && role !== oldValue.role) {
        if (user.role === 'ADMIN') {
            const allowedRoles: UserRole[] = ['KOL_MANAGER', 'ADMIN', 'BRAND'];
            if (!allowedRoles.includes(role as UserRole)) {
                return c.json(
                    {
                        success: false,
                        message: 'Invalid role',
                    },
                    400
                );
            }
            updateData.role = role as UserRole;
        } else {
            return c.json(
                {
                    success: false,
                    message: 'You do not have permission to change roles',
                },
                403
            );
        }
    }

    if (password !== undefined) {
        const passwordError = validatePassword(password);
        if (passwordError) {
            return c.json(
                {
                    success: false,
                    message: passwordError,
                },
                400
            );
        }

        const isSamePassword = await bcrypt.compare(password, oldValue.password);
        if (!isSamePassword) {
            if (user.role === 'ADMIN') {
                updateData.password = await bcrypt.hash(password, 10);
            } else {
                return c.json(
                    {
                        success: false,
                        message: 'You are not allowed to change the password',
                    },
                    403
                );
            }
        }
    }

    if (Object.keys(updateData).length === 0) {
        return c.json(
            {
                success: false,
                error: 'no_change',
                message: 'No data was changed.',
            },
            400
        );
    }

    try {
        const updatedUser = await prisma.users.update({
            where: { id },
            data: updateData,
        });

        return c.json(
            {
                success: true,
                message: `User ${updatedUser.username} updated successfully`,
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to update User data.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Delete User
export const deleteUser = async (c: Context) => {
    const id = parseInt(c.req.param('id'));

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'User ID is required.',
            },
            400
        );
    }

    try {
        const existing = await prisma.users.findUnique({ where: { id } });

        if (!existing) {
            return c.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                404
            );
        }

        await prisma.users.delete({ where: { id } });

        return c.json(
            {
                success: true,
                message: 'User successfully deleted.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to delete User.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Login User
export const loginUser = async (c: Context) => {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json(
            {
                success: false,
                message: 'Email and password is required.',
            },
            400
        );
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
        return c.json(
            {
                success: false,
                message: 'Email not registered',
                error: 'email',
            },
            401
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return c.json(
            {
                success: false,
                message: 'Wrong password',
                error: 'password',
            },
            401
        );
    }

    const token = await generateToken(user.id, user.username, user.role);

    return c.json(
        {
            success: true,
            message: 'Login successfully.',
            data: {
                token,
                user: {
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        },
        200
    );
};
