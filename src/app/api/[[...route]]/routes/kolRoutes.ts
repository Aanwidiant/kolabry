import { Hono } from "hono";
import { protect, isKOLManager } from "../middlewares";
import { kol } from "../controllers";

const kols = new Hono();

kols.post("/", protect, isKOLManager, (c) => kol.createKol(c));
kols.get("/", protect, isKOLManager, (c) => kol.getKols(c));
kols.patch("/:id", protect, isKOLManager, (c) => kol.updateKol(c));
kols.delete("/:id", protect, isKOLManager, (c) => kol.deleteKol(c));

export default kols;
