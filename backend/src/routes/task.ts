import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { MEMBERSHIP_TIERS, TASK_RATE_LIMIT_SECONDS, MAX_TASKS_PER_DAY } from "../constants";

export default new Elysia()
  .use(authMiddleware)
  .get("/status", async ({ userId, db, set }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let taskLog = await db.taskLog.findUnique({
        where: {
          user_id_date: {
            user_id: userId,
            date: today,
          },
        },
      });

      // Create if doesn't exist
      if (!taskLog) {
        taskLog = await db.taskLog.create({
          data: {
            user_id: userId,
            date: today,
            counter: 0,
          },
        });
      }

      // Get user and wallet to check balance requirement
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      let hasEnoughBalance = false;
      if (user && user.wallet && user.is_active && user.tier_level > 0) {
        const tier = MEMBERSHIP_TIERS.find((t) => t.level === user.tier_level);
        if (tier) {
          const balanceDeposit = Number(user.wallet.balance_deposit);
          hasEnoughBalance = balanceDeposit >= tier.deposit;
        }
      }

      // Check rate limit
      let canClaim = true;
      let nextClaimAvailable: Date | undefined;
      if (taskLog.last_claim) {
        const lastClaim = new Date(taskLog.last_claim);
        const now = new Date();
        const diff = (now.getTime() - lastClaim.getTime()) / 1000;
        if (diff < TASK_RATE_LIMIT_SECONDS) {
          canClaim = false;
          nextClaimAvailable = new Date(
            lastClaim.getTime() + TASK_RATE_LIMIT_SECONDS * 1000
          );
        }
      }

      // Get task configs
      const taskConfigs = await db.taskConfig.findMany({
        where: { is_active: true },
        orderBy: { sequence: "asc" },
      });

      return {
        success: true,
        data: {
          ...taskLog,
          canClaim: canClaim && taskLog.counter < MAX_TASKS_PER_DAY && hasEnoughBalance,
          hasEnoughBalance,
          nextClaimAvailable,
          taskConfigs: taskConfigs || [],
        },
      };
    } catch (error: any) {
      console.error("Get task status error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  .post("/claim", async ({ userId, db, set }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get or create task log
      let taskLog = await db.taskLog.findUnique({
        where: {
          user_id_date: {
            user_id: userId,
            date: today,
          },
        },
      });

      if (!taskLog) {
        taskLog = await db.taskLog.create({
          data: {
            user_id: userId,
            date: today,
            counter: 0,
          },
        });
      }

      // Check daily limit
      if (taskLog.counter >= MAX_TASKS_PER_DAY) {
        set.status = 400;
        return {
          success: false,
          message: "Anda sudah mencapai batas task harian (20 task)",
        };
      }

      // Check rate limit
      if (taskLog.last_claim) {
        const lastClaim = new Date(taskLog.last_claim);
        const now = new Date();
        const diff = (now.getTime() - lastClaim.getTime()) / 1000;
        if (diff < TASK_RATE_LIMIT_SECONDS) {
          set.status = 429;
          return {
            success: false,
            message: `Tunggu ${Math.ceil(TASK_RATE_LIMIT_SECONDS - diff)} detik lagi`,
          };
        }
      }

      // Get user tier to calculate reward
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user || !user.wallet) {
        set.status = 404;
        return {
          success: false,
          message: "User atau wallet tidak ditemukan",
        };
      }

      if (!user.is_active || user.tier_level === 0) {
        set.status = 400;
        return {
          success: false,
          message: "Anda belum melakukan deposit. Deposit terlebih dahulu untuk mengaktifkan akun.",
        };
      }

      // Get reward per task based on tier
      const tier = MEMBERSHIP_TIERS.find((t) => t.level === user.tier_level);
      if (!tier) {
        set.status = 400;
        return {
          success: false,
          message: "Tier membership tidak valid",
        };
      }

      // Check balance requirement - user must have balance_deposit >= tier.deposit
      const balanceDeposit = Number(user.wallet.balance_deposit);
      if (balanceDeposit < tier.deposit) {
        set.status = 400;
        return {
          success: false,
          message: `Saldo deposit Anda tidak mencukupi untuk tier ini. Deposit minimal Rp ${tier.deposit.toLocaleString("id-ID")} untuk tier ${tier.name}.`,
        };
      }

      const reward = tier.rewardPerTask;

      // Update task log
      const updatedTaskLog = await db.taskLog.update({
        where: { id: taskLog.id },
        data: {
          counter: taskLog.counter + 1,
          last_claim: new Date(),
        },
      });

      // Add reward to locked balance
      await db.wallet.update({
        where: { user_id: userId },
        data: {
          balance_reward_task: {
            increment: reward,
          },
        },
      });

      // Create transaction record
      await db.transaction.create({
        data: {
          user_id: userId,
          type: "REWARD_TASK",
          amount: reward,
          status: "SUCCESS",
        },
      });

      return {
        success: true,
        message: "Task berhasil diklaim!",
        data: {
          counter: updatedTaskLog.counter,
          reward,
          nextClaimAvailable: new Date(
            Date.now() + TASK_RATE_LIMIT_SECONDS * 1000
          ),
        },
      };
    } catch (error: any) {
      console.error("Claim task error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Get task configs for user
  .get("/configs", async ({ db, set }) => {
    try {
      const taskConfigs = await db.taskConfig.findMany({
        where: { is_active: true },
        orderBy: { sequence: "asc" },
      });

      return {
        success: true,
        data: taskConfigs,
      };
    } catch (error: any) {
      console.error("Get task configs error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  });

