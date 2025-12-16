import type { Elysia } from "elysia";

export const authMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, jwt, set }) => {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return {
        success: false,
        message: "Unauthorized - Token required",
      };
    }

    const token = authorization.substring(7);
    const payload = await jwt.verify(token);

    if (!payload || !payload.userId) {
      set.status = 401;
      return {
        success: false,
        message: "Unauthorized - Invalid token",
      };
    }

    return {
      userId: payload.userId as string,
    };
  });

