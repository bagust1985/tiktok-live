import type { Elysia } from "elysia";

export const adminMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, jwt, db, error }) => {
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

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: { is_admin: true },
    });

    if (!user || !user.is_admin) {
      return error(403, {
        success: false,
        message: "Forbidden - Admin access required",
      });
    }

    return {
      adminId: payload.userId as string,
      userId: payload.userId as string, // Also provide userId for consistency
    };
  });

