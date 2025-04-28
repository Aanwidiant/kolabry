import { Hono } from "hono";
import { protect } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/roleMiddleware";
import { user } from "../controllers";

const users = new Hono();

users.post("/", protect, isAdmin, (c) => user.createUser(c));
users.get("/", protect, isAdmin, (c) => user.getUsers(c));
users.patch("/", protect, (c) => user.updateUser(c));
users.delete("/:id", protect, isAdmin, (c) => user.removeUser(c));
users.post("/login", (c) => user.loginUser(c));
users.post("/change-password", protect, (c) => user.changePassword(c));

export default users;
