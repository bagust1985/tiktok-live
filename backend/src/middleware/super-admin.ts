import type { Elysia } from "elysia";
import { error } from "elysia";

export const superAdminMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, jwt, db, error: errorFn }) => {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return errorFn(401, {
        success: false,
        message: "Unauthorized - Token required",
      });
    }

    const token = authorization.substring(7);
    const payload = await jwt.verify(token);

    if (!payload || !payload.userId) {
      return errorFn(401, {
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    // Check if user is admin and has SUPER_ADMIN role
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: { is_admin: true, admin_role: true },
    });

    if (!user || !user.is_admin) {
      return errorFn(403, {
        success: false,
        message: "Forbidden - Admin access required",
      });
    }

    if (user.admin_role !== "SUPER_ADMIN") {
      return errorFn(403, {
        success: false,
        message: "Forbidden - Super Admin access required",
      });
    }

    return {
      adminId: payload.userId as string,
      userId: payload.userId as string,
      adminRole: user.admin_role as string,
    };
  });

