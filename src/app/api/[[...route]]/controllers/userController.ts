import {Context} from "hono";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";
import {Prisma, UserRole} from "@prisma/client";
import {Pagination} from "../helpers/pagination";
import {generateToken, validatePassword} from "../helpers";

// Create User
export const createUser = async (c: Context) => {
    const {username, email, password, role} = await c.req.json();

    if (!username || !email || !password || !role) {
        return c.json(
            {
                success: false,
                message: "All fields must be filled, including role",
            },
            400
        );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return c.json(
            {
                success: false,
                message: passwordError
            }, 400);
    }

    const existingUser = await prisma.users.findFirst({
        where: {
            OR: [{email}, {username}],
        },
    });

    if (existingUser) {
        return c.json(
            {
                success: false,
                message: "Email or username is already registered.",
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
                message: "Failed create user",
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Get User List
export const getUsers = async (c: Context) => {
    const {
        search = "",
        page = "1",
        limit = "10",
        sortBy = "created_at",
        order = "asc",
    } = c.req.query();

    const pageNumber = parseInt(page, 10);
    const limitNumber = Math.max(parseInt(limit, 10), 1);
    const offset = (pageNumber - 1) * limitNumber;

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
        return c.json({
            success: false,
            message: "Invalid page or limit number.",
        }, 400);
    }


    const allowedSortBy = ["username", "email", "created_at"];
    const allowedOrder = ["asc", "desc"];

    if (!allowedSortBy.includes(sortBy)) {
        return c.json({
            success: false,
            message: `Invalid sortBy field. Allowed values: ${allowedSortBy.join(", ")}`,
        }, 400);
    }

    if (!allowedOrder.includes(order.toLowerCase())) {
        return c.json({
            success: false,
            message: `Invalid order direction. Allowed values: ${allowedOrder.join(", ")}`,
        }, 400);
    }

    const sortField = allowedSortBy.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = allowedOrder.includes(order.toLowerCase())
        ? (order.toLowerCase() as "asc" | "desc")
        : "asc";

    const filters: Prisma.usersWhereInput = search
        ? {
            OR: [
                {
                    username: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }
        : {};
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
                skip: offset,
                take: limitNumber,
                orderBy: {
                    [sortField]: sortOrder,
                },
            }),
            prisma.users.count({where: filters}),
        ]);

        return c.json({
            success: true,
            data: users,
            pagination: Pagination({
                page: pageNumber,
                limit: limitNumber,
                total: totalUsers,
            }),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: "Failed to get users data.",
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Update User
export const updateUser = async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const {username, email, role, password} = await c.req.json();
    const user = c.get("user");

    if (!id) {
        return c.json(
            {
                success: false,
                message: "User ID is required.",
            },
            400
        );
    }

    if (user.id !== id && user.role !== "ADMIN" && role) {
        return c.json(
            {
                success: false,
                message: "You are not allowed to change roles",
            },
            403
        );
    }

    const updateData: Prisma.usersUpdateInput = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;

    if (role !== undefined) {
        if (user.role === "ADMIN") {
            const allowedRoles: UserRole[] = ["KOL_MANAGER", "ADMIN", "BRAND"];
            if (!allowedRoles.includes(role as UserRole)) {
                return c.json(
                    {
                        success: false,
                        message: "Invalid role",
                    },
                    400
                );
            }
            updateData.role = role as UserRole;
        } else {
            return c.json(
                {
                    success: false,
                    message: "You do not have permission to change roles",
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
                    message: passwordError
                }, 400);
        }

        if (user.role === "ADMIN") {
            updateData.password = await bcrypt.hash(password, 10);
        } else {
            return c.json(
                {
                    success: false,
                    message: "You are not allowed to change the password",
                },
                403
            );
        }
    }

    if (Object.keys(updateData).length === 0) {
        return c.json(
            {
                success: true,
                message: "No data updated",
            },
            400
        );
    }

    try {
        const updatedUser = await prisma.users.update({
            where: {id},
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
                message: "Failed to update User data.",
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Delete User
export const deleteUser = async (c: Context) => {
    const id = parseInt(c.req.param("id"));

    if (!id) {
        return c.json(
            {
                success: false,
                message: "User ID is required.",
            },
            400
        );
    }

    try {
        await prisma.users.delete({where: {id}});

        return c.json(
            {
                success: true,
                message: "User data successfully deleted.",
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: "Failed to delete User data.",
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Login User
export const loginUser = async (c: Context) => {
    const {email, password} = await c.req.json();

    if (!email || !password) {
        return c.json(
            {
                success: false,
                message: "Email and password is required.",
            },
            400
        );
    }

    const user = await prisma.users.findUnique({where: {email}});

    if (!user) {
        return c.json(
            {
                success: false,
                message: "Email not registered",
            },
            401
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return c.json(
            {
                success: false,
                message: "Wrong password",
            },
            401
        );
    }

    const token = generateToken(user.id, user.username, user.role);

    return c.json(
        {
            success: true,
            message: "Login successfully.",
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

// Change Password
export const changePassword = async (c: Context) => {
    const {oldPassword, newPassword} = await c.req.json();
    const user = c.get("user");

    if (!oldPassword || !newPassword) {
        return c.json(
            {
                success: false,
                message: "Old password and new password is required",
            },
            400
        );
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        return c.json(
            {
                success: false,
                message: passwordError
            }, 400);
    }

    const existingUser = await prisma.users.findUnique({
        where: {id: user.id},
    });

    if (!existingUser) {
        return c.json(
            {
                success: false,
                message: "User not found",
            },
            404
        );
    }

    const isPasswordValid = await bcrypt.compare(
        oldPassword,
        existingUser.password
    );

    if (!isPasswordValid) {
        return c.json(
            {
                success: false,
                message: "Old password is invalid",
            },
            400
        );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
        where: {id: user.id},
        data: {password: hashedPassword},
    });

    return c.json(
        {
            success: true,
            message: "Password changed successfully",
        },
        200
    );
};
