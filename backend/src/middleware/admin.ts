import type { Elysia } from "elysia";

export const adminMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, jwt, db, set }) => {
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

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: { is_admin: true },
    });

    if (!user || !user.is_admin) {
      set.status = 403;
      return {
        success: false,
        message: "Forbidden - Admin access required",
      };
    }

    return {
      adminId: payload.userId as string,
    };
  });

