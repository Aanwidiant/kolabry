import { Hono } from "hono";
import { protect, isAdmin } from "../middlewares";
import { user } from "../controllers";

const users = new Hono();

users.post("/", protect, isAdmin, (c) => user.createUser(c));
users.get("/", protect, isAdmin, (c) => user.getUsers(c));
users.patch("/:id", protect, (c) => user.updateUser(c));
users.delete("/:id", protect, isAdmin, (c) => user.deleteUser(c));
users.post("/login", (c) => user.loginUser(c));
users.post("/change-password", protect, (c) => user.changePassword(c));

export default users;
