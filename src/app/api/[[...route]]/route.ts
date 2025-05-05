import { Hono } from "hono";
import {User, Kol, KolType} from "./routes";

const app = new Hono().basePath("/api");

app.route("/user", User);
app.route("/kol", Kol);
app.route("/kol-type", KolType);

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
