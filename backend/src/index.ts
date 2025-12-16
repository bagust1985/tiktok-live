import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

// Import routes
import publicRoutes from "./routes/public";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";
import walletRoutes from "./routes/wallet";
import networkRoutes from "./routes/network";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import uploadsRoutes from "./routes/uploads";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Ensure uploads directories exist
const uploadsDirs = [
  join(process.cwd(), "public", "uploads", "avatars"),
  join(process.cwd(), "public", "uploads", "proofs"),
];

uploadsDirs.forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

const app = new Elysia()
  .use(cors({
    origin: true, // Allow all origins in dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    })
  )
  .decorate("db", prisma)
  .get("/", () => {
    return { message: "Tiktok Live&Like API", version: "1.0.0" };
  })
  .group("/public", (app) => app.use(publicRoutes))
  .group("/auth", (app) => app.use(authRoutes))
  .group("/user", (app) => app.use(userRoutes))
  .group("/task", (app) => app.use(taskRoutes))
  .group("/wallet", (app) => app.use(walletRoutes))
  .group("/network", (app) => app.use(networkRoutes))
  .group("/admin", (app) => app.use(adminRoutes))
  .group("/uploads", (app) => app.use(uploadsRoutes))
  .listen(PORT);

console.log(`🚀 Server is running at http://localhost:${PORT}`);

export type App = typeof app;

