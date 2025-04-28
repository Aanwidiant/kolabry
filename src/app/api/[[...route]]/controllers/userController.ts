import { Context } from "hono";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const generateToken = (userId: number, username: string, role: string) => {
  return sign({ id: userId, username, role }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
};

const validatePasswordContain =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// Create User
export const createUser = async (c: Context) => {
  const { username, email, password, role } = await c.req.json();

  if (!username || !email || !password || !role) {
    return c.json({ error: "All fields must be filled, including role." }, 400);
  }

  if (!validatePasswordContain.test(password)) {
    return c.json(
      {
        error:
          "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.",
      },
      400
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    return c.json({ error: "Email or username is already registered." }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
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
};

// Get Users
export const getUsers = async (c: Context) => {
  const { search, page = 1, limit = 10 } = c.req.query();

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  const offset = (pageNumber - 1) * limitNumber;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
    skip: offset,
    take: limitNumber,
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalUsers = await prisma.user.count({
    where: {
      OR: [
        { username: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ],
    },
  });

  const totalPages = Math.ceil(totalUsers / limitNumber);

  return c.json({
    success: true,
    data: users,
    pagination: {
      total: totalUsers,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    },
  });
};

// Update User
export const updateUser = async (c: Context) => {
  const { id, username, email, role, password } = await c.req.json();
  const user = c.get("user");

  if (!id) {
    return c.json({ error: "ID user harus disediakan" }, 400);
  }

  if (user.id !== id && user.role !== "ADMIN" && role) {
    return c.json({ error: "Anda tidak diizinkan untuk mengubah role" }, 403);
  }

  const updateData: {
    username?: string;
    email?: string;
    role?: string;
    password?: string;
  } = {};

  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;

  if (role !== undefined) {
    if (user.role === "ADMIN") {
      if (
        role !== "KOL_MANAGER" &&
        role !== "ADMIN" &&
        role !== "CLIENT" &&
        role !== "STAFF"
      ) {
        return c.json({ error: "Role tidak valid" }, 400);
      }
      updateData.role = role;
    } else {
      return c.json(
        { error: "Anda tidak memiliki izin untuk mengubah role" },
        403
      );
    }
  }

  if (password !== undefined) {
    if (!validatePasswordContain.test(password)) {
      return c.json(
        {
          error:
            "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.",
        },
        400
      );
    }

    if (user.role === "ADMIN") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    } else {
      return c.json(
        { error: "Anda tidak diizinkan untuk mengubah password" },
        403
      );
    }
  }

  if (Object.keys(updateData).length === 0) {
    return c.json({ error: "Tidak ada data yang diupdate" }, 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return c.json({
    success: true,
    message: `User ${updatedUser.username} updated successfully`,
  });
};

// Delete User
export const removeUser = async (c: Context) => {
  const id = parseInt(c.req.param("id"));

  if (!id) {
    return c.json({ error: "ID user harus disediakan" }, 400);
  }

  await prisma.user.delete({ where: { id } });

  return c.json({ success: true, message: "User berhasil dihapus" });
};

// Login User
export const loginUser = async (c: Context) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email dan password harus diisi" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return c.json({ error: "Email atau password salah" }, 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return c.json({ error: "Email atau password salah" }, 401);
  }

  const token = generateToken(user.id, user.username, user.role);

  return c.json({
    success: true,
    message: "Login successfully.",
    data: { token },
  });
};

// Change Password
export const changePassword = async (c: Context) => {
  const { oldPassword, newPassword } = await c.req.json();
  const user = c.get("user");

  if (!oldPassword || !newPassword) {
    return c.json({ error: "Old password dan new password wajib diisi" }, 400);
  }

  if (!validatePasswordContain.test(newPassword)) {
    return c.json(
      {
        error:
          "Password baru harus memiliki minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial.",
      },
      400
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!existingUser) {
    return c.json({ error: "User tidak ditemukan" }, 404);
  }

  const isPasswordValid = await bcrypt.compare(
    oldPassword,
    existingUser.password
  );

  if (!isPasswordValid) {
    return c.json({ error: "Password lama tidak valid" }, 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return c.json({
    success: true,
    message: "Password berhasil diubah",
  });
};
