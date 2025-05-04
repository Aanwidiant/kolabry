import { Hono } from "hono";
import { User, Kol } from "./routes";

const app = new Hono().basePath("/api");

app.route("/user", User);
app.route("/kol", Kol);

export async function GET(request: Request) {
  return app.fetch(request);
}

export async function POST(request: Request) {
  return app.fetch(request);
}

export async function PATCH(request: Request) {
  return app.fetch(request);
}

export async function DELETE(request: Request) {
  return app.fetch(request);
}
