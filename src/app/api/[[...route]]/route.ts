import { Hono } from "hono";
import { Users } from "./routes";

const app = new Hono().basePath("/api");

app.route("/users", Users);

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
