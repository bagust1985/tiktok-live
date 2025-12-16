import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";

export default new Elysia()
  .use(authMiddleware)
  .get("/stats", async ({ userId, db, set }) => {
    try {
      // Get total downlines (unilevel)
      const totalDownlines = await db.user.count({
        where: { sponsor_id: userId },
      });

      // Get binary counts
      const binaryDownlines = await db.user.findMany({
        where: { upline_binary_id: userId },
      });

      const leftCount = binaryDownlines.filter((u) => u.position === "LEFT").length;
      const rightCount = binaryDownlines.filter((u) => u.position === "RIGHT").length;

      // Calculate total deposit from network
      const networkUsers = await db.user.findMany({
        where: {
          OR: [
            { sponsor_id: userId },
            { upline_binary_id: userId },
          ],
        },
        include: { wallet: true },
      });

      const totalDepositFromNetwork = networkUsers.reduce((sum, user) => {
        return sum + Number(user.wallet?.balance_deposit || 0);
      }, 0);

      // Get transactions for bonus calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sponsorBonusToday = await db.transaction.aggregate({
        where: {
          user_id: userId,
          type: "BONUS_SPONSOR",
          status: "SUCCESS",
          created_at: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const sponsorBonusThisMonth = await db.transaction.aggregate({
        where: {
          user_id: userId,
          type: "BONUS_SPONSOR",
          status: "SUCCESS",
          created_at: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
        _sum: {
          amount: true,
        },
      });

      const pairingBonusToday = await db.transaction.aggregate({
        where: {
          user_id: userId,
          type: "BONUS_PAIRING",
          status: "SUCCESS",
          created_at: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const pairingBonusThisMonth = await db.transaction.aggregate({
        where: {
          user_id: userId,
          type: "BONUS_PAIRING",
          status: "SUCCESS",
          created_at: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
        _sum: {
          amount: true,
        },
      });

      const matchingBonusToday = await db.transaction.aggregate({
        where: {
          user_id: userId,
          type: "BONUS_MATCHING",
          status: "SUCCESS",
          created_at: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const matchingBonusThisMonth = await db.transaction.aggregate({
        where: {
          user_id: userId,
          type: "BONUS_MATCHING",
          status: "SUCCESS",
          created_at: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Get matching bonus by level (simplified - in production, calculate from actual downline levels)
      const matchingBonusByLevel = {
        level1: Number(matchingBonusToday._sum.amount || 0) * 0.5,
        level2: Number(matchingBonusToday._sum.amount || 0) * 0.3,
        level3: Number(matchingBonusToday._sum.amount || 0) * 0.2,
      };

      return {
        success: true,
        data: {
          totalDownlines,
          leftCount,
          rightCount,
          totalDepositFromNetwork,
          sponsorBonusToday: Number(sponsorBonusToday._sum.amount || 0),
          sponsorBonusThisMonth: Number(sponsorBonusThisMonth._sum.amount || 0),
          pairingBonusToday: Number(pairingBonusToday._sum.amount || 0),
          pairingBonusThisMonth: Number(pairingBonusThisMonth._sum.amount || 0),
          matchingBonusToday: Number(matchingBonusToday._sum.amount || 0),
          matchingBonusThisMonth: Number(matchingBonusThisMonth._sum.amount || 0),
          matchingBonusByLevel,
        },
      };
    } catch (error: any) {
      console.error("Get network stats error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  });

