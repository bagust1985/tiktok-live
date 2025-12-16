import { Elysia } from "elysia";

export default new Elysia()
  // Get active banks (public, no auth required)
  .get("/banks", async ({ db, set }) => {
    try {
      const banks = await db.companyBank.findMany({
        where: {
          is_active: true,
        },
        orderBy: {
          created_at: "asc",
        },
      });

      return {
        success: true,
        data: banks,
      };
    } catch (error: any) {
      console.error("Get public banks error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Get active contacts (public, no auth required)
  .get("/contacts", async ({ db, set }) => {
    try {
      const contacts = await db.contactCenter.findMany({
        where: {
          is_active: true,
        },
        orderBy: {
          sequence: "asc",
        },
      });

      return {
        success: true,
        data: contacts,
      };
    } catch (error: any) {
      console.error("Get public contacts error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  });

