import type { Elysia } from "elysia";

export const authMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, jwt, set, error }) => {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return error(401, {
        success: false,
        message: "Unauthorized - Token required",
      });
    }

    const token = authorization.substring(7);
    const payload = await jwt.verify(token);

    if (!payload || !payload.userId) {
      return error(401, {
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    return {
      userId: payload.userId as string,
    };
  });

