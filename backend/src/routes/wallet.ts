import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { MEMBERSHIP_TIERS, LOCK_PERIOD_DAYS } from "../constants";

const MIN_WITHDRAW_AMOUNT = 50000;

export default new Elysia()
  .use(authMiddleware)
  .get("/balance", async ({ userId, db, set }) => {
    try {
      const wallet = await db.wallet.findUnique({
        where: { user_id: userId },
      });

      if (!wallet) {
        set.status = 404;
        return {
          success: false,
          message: "Wallet tidak ditemukan",
        };
      }

      return {
        success: true,
        data: {
          ...wallet,
          balance_deposit: Number(wallet.balance_deposit),
          balance_reward_task: Number(wallet.balance_reward_task),
          balance_matching_lock: Number(wallet.balance_matching_lock),
          balance_available: Number(wallet.balance_available),
        },
      };
    } catch (error: any) {
      console.error("Get balance error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  .post("/deposit", async ({ userId, body, db, set }) => {
    try {
      const { tier_level, amount, proof_image, notes } = body as any;

      // Validate tier
      const tier = MEMBERSHIP_TIERS.find((t) => t.level === tier_level);
      if (!tier) {
        set.status = 400;
        return {
          success: false,
          message: "Tier membership tidak valid",
        };
      }

      if (amount !== tier.deposit) {
        set.status = 400;
        return {
          success: false,
          message: `Jumlah deposit harus ${tier.deposit.toLocaleString("id-ID")}`,
        };
      }

      // Check if user already has active deposit
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

      if (user.tier_level > 0 && Number(user.wallet.balance_deposit) > 0) {
        set.status = 400;
        return {
          success: false,
          message: "Anda sudah memiliki deposit aktif",
        };
      }

      // Handle file upload (proof_image is base64 string in this case)
      // In production, use proper file upload handling or cloud storage
      let proofImageUrl: string | null = null;
      if (proof_image && typeof proof_image === 'string') {
        // Store base64 reference or decode and save to file system
        // For now, just store as reference
        proofImageUrl = proof_image.substring(0, 100) + '...'; // Truncated for storage
        // In production: decode base64 and save to cloud storage (S3, etc)
      }

      // Create transaction with PENDING status
      const transaction = await db.transaction.create({
        data: {
          user_id: userId,
          type: "DEPOSIT",
          amount: amount,
          status: "PENDING",
          proof_image_url: proofImageUrl,
          notes: notes || null,
        },
      });

      // In production, admin will verify and update transaction status
      // Then activate user and add to wallet balance_deposit

      return {
        success: true,
        message: "Deposit berhasil diajukan, menunggu verifikasi admin",
        data: {
          id: transaction.id,
          amount: Number(transaction.amount),
          status: transaction.status,
        },
      };
    } catch (error: any) {
      console.error("Deposit error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  .post(
    "/withdraw",
    async ({ userId, body, db, set }) => {
      try {
        const { amount, bank_name, bank_account, account_name } = body as any;

        if (!amount || !bank_name || !bank_account || !account_name) {
          set.status = 400;
          return {
            success: false,
            message: "Data tidak lengkap",
          };
        }

        if (amount < MIN_WITHDRAW_AMOUNT) {
          set.status = 400;
          return {
            success: false,
            message: `Minimum withdraw adalah ${MIN_WITHDRAW_AMOUNT.toLocaleString("id-ID")}`,
          };
        }

        const wallet = await db.wallet.findUnique({
          where: { user_id: userId },
        });

        if (!wallet) {
          set.status = 404;
          return {
            success: false,
            message: "Wallet tidak ditemukan",
          };
        }

        if (Number(wallet.balance_available) < amount) {
          set.status = 400;
          return {
            success: false,
            message: "Saldo tidak mencukupi",
          };
        }

        // Create transaction with PENDING status
        const transaction = await db.transaction.create({
          data: {
            user_id: userId,
            type: "WD_AVAILABLE",
            amount: amount,
            status: "PENDING",
            bank_name,
            bank_account,
            account_name,
          },
        });

        // Deduct from available balance immediately (will be reversed if rejected)
        await db.wallet.update({
          where: { user_id: userId },
          data: {
            balance_available: {
              decrement: amount,
            },
          },
        });

        return {
          success: true,
          message: "Withdraw berhasil diajukan, menunggu proses admin",
          data: {
            id: transaction.id,
            amount: Number(transaction.amount),
            status: transaction.status,
          },
        };
      } catch (error: any) {
        console.error("Withdraw error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan",
        };
      }
    },
    {
      body: {
        type: "object",
        properties: {
          amount: { type: "number" },
          bank_name: { type: "string" },
          bank_account: { type: "string" },
          account_name: { type: "string" },
        },
        required: ["amount", "bank_name", "bank_account", "account_name"],
      },
    }
  )
  .get("/transactions", async ({ userId, query, db, set }) => {
    try {
      const { type, status } = query as any;

      const where: any = { user_id: userId };
      if (type) where.type = type;
      if (status) where.status = status;

      const transactions = await db.transaction.findMany({
        where,
        orderBy: { created_at: "desc" },
      });

      return {
        success: true,
        data: transactions.map((tx) => ({
          ...tx,
          amount: Number(tx.amount),
        })),
      };
    } catch (error: any) {
      console.error("Get transactions error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  });

