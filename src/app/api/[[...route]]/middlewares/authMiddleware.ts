import { Context } from "hono";
import { verify } from "jsonwebtoken";

export const protect = async (c: Context, next: () => Promise<void>) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return c.json({ error: "Tidak ada token, akses ditolak" }, 401);
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    c.set("user", decoded);
    await next();
  } catch {
    return c.json({ error: "Token tidak valid" }, 401);
  }
};
