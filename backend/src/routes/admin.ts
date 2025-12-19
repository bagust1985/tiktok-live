import { Elysia } from "elysia";
import { adminMiddleware } from "../middleware/admin";
import { superAdminMiddleware } from "../middleware/super-admin";
import { MEMBERSHIP_TIERS, LOCK_PERIOD_DAYS } from "../constants";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export default new Elysia()
  .use(adminMiddleware)
  // Dashboard Statistics
  .get("/stats", async ({ db, set }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // User statistics
      const totalUsers = await db.user.count();
      const activeUsers = await db.user.count({ where: { is_active: true } });
      const newUsersToday = await db.user.count({
        where: { created_at: { gte: today } },
      });
      const newUsersThisMonth = await db.user.count({
        where: { created_at: { gte: startOfMonth } },
      });

      // Transaction statistics
      const totalDeposits = await db.transaction.aggregate({
        where: { type: "DEPOSIT", status: "SUCCESS" },
        _sum: { amount: true },
      });

      const totalWithdrawals = await db.transaction.aggregate({
        where: { type: { in: ["WD_AVAILABLE", "WD_LOCKED"] }, status: "SUCCESS" },
        _sum: { amount: true },
      });

      const pendingDeposits = await db.transaction.count({
        where: { type: "DEPOSIT", status: "PENDING" },
      });

      const pendingWithdrawals = await db.transaction.count({
        where: { type: { in: ["WD_AVAILABLE", "WD_LOCKED"] }, status: "PENDING" },
      });

      const todayTransactions = await db.transaction.count({
        where: { created_at: { gte: today } },
      });

      const thisMonthTransactions = await db.transaction.count({
        where: { created_at: { gte: startOfMonth } },
      });

      // Wallet statistics
      const totalLockedBalance = await db.wallet.aggregate({
        _sum: {
          balance_deposit: true,
          balance_reward_task: true,
          balance_matching_lock: true,
        },
      });

      const totalAvailableBalance = await db.wallet.aggregate({
        _sum: { balance_available: true },
      });

      return {
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newToday: newUsersToday,
            newThisMonth: newUsersThisMonth,
          },
          transactions: {
            totalDeposits: Number(totalDeposits._sum.amount || 0),
            totalWithdrawals: Number(totalWithdrawals._sum.amount || 0),
            pendingDeposits,
            pendingWithdrawals,
            today: todayTransactions,
            thisMonth: thisMonthTransactions,
          },
          wallets: {
            totalLocked:
              Number(totalLockedBalance._sum.balance_deposit || 0) +
              Number(totalLockedBalance._sum.balance_reward_task || 0) +
              Number(totalLockedBalance._sum.balance_matching_lock || 0),
            totalAvailable: Number(totalAvailableBalance._sum.balance_available || 0),
          },
        },
      };
    } catch (error: any) {
      console.error("Get admin stats error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Get all transactions with filters
  .get("/transactions", async ({ query, db, set }) => {
    try {
      const type = (query as any).type;
      const status = (query as any).status;
      const date_from = (query as any).date_from;
      const date_to = (query as any).date_to;
      const user_id = (query as any).user_id;
      const page = (query as any).page || "1";
      const limit = (query as any).limit || "50";

      const where: any = {};
      if (type && type !== "") where.type = type;
      if (status && status !== "") where.status = status;
      if (user_id && user_id !== "") where.user_id = user_id;
      if (date_from || date_to) {
        where.created_at = {};
        if (date_from && date_from !== "") where.created_at.gte = new Date(date_from);
        if (date_to && date_to !== "") {
          const toDate = new Date(date_to);
          toDate.setHours(23, 59, 59, 999);
          where.created_at.lte = toDate;
        }
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const skip = (pageNum - 1) * limitNum;

      const [transactions, total] = await Promise.all([
        db.transaction.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
          skip,
          take: limitNum,
        }),
        db.transaction.count({ where }),
      ]);

      return {
        success: true,
        data: {
          transactions: transactions.map((tx: any) => ({
            ...tx,
            amount: Number(tx.amount),
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      };
    } catch (error: any) {
      console.error("Get admin transactions error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Get transaction detail
  .get("/transactions/:id", async ({ params, db, set }) => {
    try {
      const transaction = await db.transaction.findUnique({
        where: { id: params.id },
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      });

      if (!transaction) {
        set.status = 404;
        return {
          success: false,
          message: "Transaction tidak ditemukan",
        };
      }

      return {
        success: true,
        data: {
          ...transaction,
          amount: Number(transaction.amount),
          user: transaction.user
            ? {
                ...transaction.user,
                wallet: transaction.user.wallet
                  ? {
                      ...transaction.user.wallet,
                      balance_deposit: Number(transaction.user.wallet.balance_deposit),
                      balance_reward_task: Number(transaction.user.wallet.balance_reward_task),
                      balance_matching_lock: Number(transaction.user.wallet.balance_matching_lock),
                      balance_available: Number(transaction.user.wallet.balance_available),
                    }
                  : null,
              }
            : null,
        },
      };
    } catch (error: any) {
      console.error("Get transaction detail error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Approve transaction
  .put("/transactions/:id/approve", async ({ params, db, set }) => {
    try {
      const transaction = await db.transaction.findUnique({
        where: { id: params.id },
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      });

      if (!transaction) {
        set.status = 404;
        return {
          success: false,
          message: "Transaction tidak ditemukan",
        };
      }

      if (transaction.status !== "PENDING") {
        set.status = 400;
        return {
          success: false,
          message: "Transaction sudah diproses",
        };
      }

      // Handle deposit approval
      if (transaction.type === "DEPOSIT") {
        const amount = Number(transaction.amount);
        const tier = MEMBERSHIP_TIERS.find((t) => t.deposit === amount);

        if (!tier) {
          set.status = 400;
          return {
            success: false,
            message: "Tier tidak valid untuk deposit amount",
          };
        }

        // Update user tier and activate
        await db.user.update({
          where: { id: transaction.user_id },
          data: {
            tier_level: tier.level,
            is_active: true,
          },
        });

        // Update wallet - add to locked deposit
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + LOCK_PERIOD_DAYS);

        await db.wallet.update({
          where: { user_id: transaction.user_id },
          data: {
            balance_deposit: {
              increment: amount,
            },
            unlock_date: unlockDate,
          },
        });

        // Calculate sponsor bonus (10% of deposit)
        if (transaction.user.sponsor_id) {
          const sponsorBonus = amount * 0.1;
          await db.wallet.update({
            where: { user_id: transaction.user.sponsor_id },
            data: {
              balance_available: {
                increment: sponsorBonus,
              },
            },
          });

          // Create sponsor bonus transaction
          await db.transaction.create({
            data: {
              user_id: transaction.user.sponsor_id,
              type: "BONUS_SPONSOR",
              amount: sponsorBonus,
              status: "SUCCESS",
            },
          });
        }
      }

      // Update transaction status
      await db.transaction.update({
        where: { id: params.id },
        data: {
          status: "SUCCESS",
        },
      });

      return {
        success: true,
        message: "Transaction berhasil disetujui",
      };
    } catch (error: any) {
      console.error("Approve transaction error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Reject transaction
  .put("/transactions/:id/reject", async ({ params, body, db, set }) => {
    try {
      const reason = (body as any)?.reason;

      const transaction = await db.transaction.findUnique({
        where: { id: params.id },
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      });

      if (!transaction) {
        set.status = 404;
        return {
          success: false,
          message: "Transaction tidak ditemukan",
        };
      }

      if (transaction.status !== "PENDING") {
        set.status = 400;
        return {
          success: false,
          message: "Transaction sudah diproses",
        };
      }

      // If withdrawing, refund the amount
      if (transaction.type === "WD_AVAILABLE" || transaction.type === "WD_LOCKED") {
        await db.wallet.update({
          where: { user_id: transaction.user_id },
          data: {
            balance_available: {
              increment: Number(transaction.amount),
            },
          },
        });
      }

      // Update transaction status
      await db.transaction.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejected_reason: reason || "Ditolak oleh admin",
        },
      });

      return {
        success: true,
        message: "Transaction berhasil ditolak",
      };
    } catch (error: any) {
      console.error("Reject transaction error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // ===== SUPER ADMIN ONLY ROUTES =====
  .group("/users", (app) =>
    app
      .use(superAdminMiddleware)
      // Get all users
      .get("/", async ({ query, db, set }) => {
    try {
      const search = (query as any).search;
      const tier_level = (query as any).tier_level;
      const is_active = (query as any).is_active;
      const page = (query as any).page || "1";
      const limit = (query as any).limit || "50";

      const where: any = {};
      if (tier_level !== undefined && tier_level !== "") {
        where.tier_level = parseInt(tier_level);
      }
      if (is_active !== undefined && is_active !== "") {
        where.is_active = is_active === "true";
      }
      if (search && search !== "") {
        where.OR = [
          { username: { contains: search } },
          { email: { contains: search } },
        ];
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          include: {
            wallet: true,
            _count: {
              select: {
                downlines: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
          skip,
          take: limitNum,
        }),
        db.user.count({ where }),
      ]);

      return {
        success: true,
        data: {
          users: users.map((user: any) => {
            const { password: _, ...userWithoutPassword } = user;
            return {
              ...userWithoutPassword,
              wallet: user.wallet
                ? {
                    ...user.wallet,
                    balance_deposit: Number(user.wallet.balance_deposit),
                    balance_reward_task: Number(user.wallet.balance_reward_task),
                    balance_matching_lock: Number(user.wallet.balance_matching_lock),
                    balance_available: Number(user.wallet.balance_available),
                  }
                : null,
            };
          }),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      };
    } catch (error: any) {
      console.error("Get admin users error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Get user detail
  .get("/:id", async ({ params, db, set }) => {
    try {
      const user = await db.user.findUnique({
        where: { id: params.id },
        include: {
          wallet: true,
          sponsor: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              downlines: true,
              transactions: true,
            },
          },
        },
      });

      if (!user) {
        set.status = 404;
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          ...userWithoutPassword,
          wallet: user.wallet
            ? {
                ...user.wallet,
                balance_deposit: Number(user.wallet.balance_deposit),
                balance_reward_task: Number(user.wallet.balance_reward_task),
                balance_matching_lock: Number(user.wallet.balance_matching_lock),
                balance_available: Number(user.wallet.balance_available),
              }
            : null,
          _count: user._count,
          sponsor: user.sponsor || null,
        },
      };
    } catch (error: any) {
      console.error("Get user detail error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Update user
  .put("/:id", async ({ params, body, db, set }) => {
    try {
      const tier_level = (body as any)?.tier_level;
      const is_active = (body as any)?.is_active;

      const updateData: any = {};
      if (tier_level !== undefined) updateData.tier_level = tier_level;
      if (is_active !== undefined) updateData.is_active = is_active;

      const user = await db.user.update({
        where: { id: params.id },
        data: updateData,
        include: {
          wallet: true,
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "User berhasil diupdate",
        data: userWithoutPassword,
      };
    } catch (error: any) {
      console.error("Update user error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Manual Balance Adjustment
  .put("/:id/adjust-balance", async ({ params, body, db, set }) => {
    try {
      const { walletType, action, amount, notes, triggerBonus } = body as any;

      // Validation
      if (!walletType || !action || !amount) {
        set.status = 400;
        return {
          success: false,
          message: "walletType, action, dan amount wajib diisi",
        };
      }

      if (!["DEPOSIT_LOCKED", "AVAILABLE"].includes(walletType)) {
        set.status = 400;
        return {
          success: false,
          message: "walletType harus DEPOSIT_LOCKED atau AVAILABLE",
        };
      }

      if (!["ADD", "CUT"].includes(action)) {
        set.status = 400;
        return {
          success: false,
          message: "action harus ADD atau CUT",
        };
      }

      if (amount <= 0) {
        set.status = 400;
        return {
          success: false,
          message: "amount harus lebih dari 0",
        };
      }

      // Get user and wallet
      const user = await db.user.findUnique({
        where: { id: params.id },
        include: { wallet: true },
      });

      if (!user || !user.wallet) {
        set.status = 404;
        return {
          success: false,
          message: "User atau wallet tidak ditemukan",
        };
      }

      // Calculate adjustment value
      const value = action === "ADD" ? amount : -amount;

      // Update wallet in transaction
      await db.$transaction(async (tx: any) => {
        if (walletType === "DEPOSIT_LOCKED") {
          // Check if balance will go negative
          const currentBalance = Number(user.wallet.balance_deposit);
          if (action === "CUT" && currentBalance + value < 0) {
            throw new Error("Saldo tidak cukup untuk deduction");
          }

          const updateData: any = {
            balance_deposit: { increment: value },
          };

          // If adding to locked deposit, set unlock_date = H+90
          if (action === "ADD") {
            const unlockDate = new Date();
            unlockDate.setDate(unlockDate.getDate() + LOCK_PERIOD_DAYS);
            updateData.unlock_date = unlockDate;
          }

          await tx.wallet.update({
            where: { user_id: params.id },
            data: updateData,
          });

          // Trigger sponsor bonus if requested
          if (action === "ADD" && triggerBonus && user.sponsor_id) {
            const bonusAmount = Math.floor(amount * 0.1); // 10% sponsor bonus
            const sponsor = await tx.user.findUnique({
              where: { id: user.sponsor_id },
              include: { wallet: true },
            });

            if (sponsor && sponsor.wallet) {
              await tx.wallet.update({
                where: { user_id: user.sponsor_id },
                data: {
                  balance_available: { increment: bonusAmount },
                },
              });

              await tx.transaction.create({
                data: {
                  user_id: user.sponsor_id,
                  type: "BONUS_SPONSOR",
                  amount: bonusAmount,
                  status: "SUCCESS",
                  notes: `Sponsor bonus dari manual adjustment user ${user.username}`,
                },
              });
            }
          }
        } else {
          // AVAILABLE balance
          const currentBalance = Number(user.wallet.balance_available);
          if (action === "CUT" && currentBalance + value < 0) {
            throw new Error("Saldo tidak cukup untuk deduction");
          }

          await tx.wallet.update({
            where: { user_id: params.id },
            data: {
              balance_available: { increment: value },
            },
          });
        }

        // Create transaction record
        await tx.transaction.create({
          data: {
            user_id: params.id,
            type: "MANUAL_ADJUSTMENT",
            amount: Math.abs(value),
            status: "SUCCESS",
            notes: notes || `Admin Adjustment: ${action} ${amount} to ${walletType}`,
          },
        });
      });

      // Get updated user data
      const updatedUser = await db.user.findUnique({
        where: { id: params.id },
        include: { wallet: true },
      });

      const { password: _, ...userWithoutPassword } = updatedUser!;

      return {
        success: true,
        message: "Saldo berhasil diupdate",
        data: userWithoutPassword,
      };
    } catch (error: any) {
      console.error("Adjust balance error:", error);
      set.status = 500;
      return {
        success: false,
        message: error.message || "Terjadi kesalahan",
      };
    }
  })
      // User Actions - Ban/Unban
      .put("/:id/ban", async ({ params, body, db, set }) => {
    try {
      const { banned } = body as any;

      const user = await db.user.update({
        where: { id: params.id },
        data: { is_active: !banned },
        include: { wallet: true },
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: banned ? "User berhasil di-ban" : "User berhasil di-unban",
        data: userWithoutPassword,
      };
    } catch (error: any) {
      console.error("Ban user error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      // User Actions - Reset Password
      .put("/:id/reset-password", async ({ params, db, set }) => {
    try {
      // Generate random password (8 characters)
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
      let plainPassword = "";
      for (let i = 0; i < 8; i++) {
        plainPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Hash password
      const hashedPassword = await Bun.password.hash(plainPassword, {
        algorithm: "argon2id",
      });

      await db.user.update({
        where: { id: params.id },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        message: "Password berhasil direset",
        data: {
          newPassword: plainPassword,
        },
      };
    } catch (error: any) {
      console.error("Reset password error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      // Network Viewer - Get user network tree
      .get("/:id/network", async ({ params, db, set }) => {
    try {
      const user = await db.user.findUnique({
        where: { id: params.id },
        include: {
          wallet: true,
          binary_downlines: {
            include: {
              wallet: true,
            },
            orderBy: { position: "asc" },
          },
        },
      });

      if (!user) {
        set.status = 404;
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      // Recursive function to build network tree
      const buildNetworkTree = async (userId: string): Promise<any> => {
        const userNode = await db.user.findUnique({
          where: { id: userId },
          include: {
            wallet: true,
            binary_downlines: {
              include: { wallet: true },
              orderBy: { position: "asc" },
            },
          },
        });

        if (!userNode) return null;

        const leftDownline = userNode.binary_downlines.find((d: any) => d.position === "LEFT");
        const rightDownline = userNode.binary_downlines.find((d: any) => d.position === "RIGHT");

        return {
          id: userNode.id,
          username: userNode.username,
          email: userNode.email,
          tier_level: userNode.tier_level,
          is_active: userNode.is_active,
          position: userNode.position,
          balance_deposit: Number(userNode.wallet?.balance_deposit || 0),
          balance_available: Number(userNode.wallet?.balance_available || 0),
          left: leftDownline ? await buildNetworkTree(leftDownline.id) : null,
          right: rightDownline ? await buildNetworkTree(rightDownline.id) : null,
        };
      };

      const networkTree = await buildNetworkTree(params.id);

      return {
        success: true,
        data: networkTree,
      };
    } catch (error: any) {
      console.error("Get network error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
      })
  )
  // ===== SETTINGS (SUPER ADMIN ONLY) =====
  .group("/banks", (app) =>
    app
      .use(superAdminMiddleware)
      // Company Bank Management
      .get("/", async ({ db, set }) => {
    try {
      const banks = await db.companyBank.findMany({
        orderBy: { created_at: "asc" },
      });

      return {
        success: true,
        data: banks,
      };
    } catch (error: any) {
      console.error("Get company banks error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .post("/", async ({ db, body, set }) => {
    try {
      const { bank_name, account_number, account_holder, is_active } = body as any;

      const bank = await db.companyBank.create({
        data: {
          bank_name,
          account_number,
          account_holder,
          is_active: is_active !== undefined ? Boolean(is_active) : true,
        },
      });

      return {
        success: true,
        message: "Bank berhasil ditambahkan",
        data: bank,
      };
    } catch (error: any) {
      console.error("Create company bank error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .put("/:id", async ({ params, db, body, set }) => {
    try {
      const { bank_name, account_number, account_holder, is_active } = body as any;

      const updateData: any = {};
      if (bank_name !== undefined) updateData.bank_name = bank_name;
      if (account_number !== undefined) updateData.account_number = account_number;
      if (account_holder !== undefined) updateData.account_holder = account_holder;
      if (is_active !== undefined) updateData.is_active = Boolean(is_active);

      const bank = await db.companyBank.update({
        where: { id: parseInt(params.id) },
        data: updateData,
      });

      return {
        success: true,
        message: "Bank berhasil diupdate",
        data: bank,
      };
    } catch (error: any) {
      console.error("Update company bank error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .put("/:id/toggle", async ({ params, db, set }) => {
    try {
      const bank = await db.companyBank.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!bank) {
        set.status = 404;
        return {
          success: false,
          message: "Bank tidak ditemukan",
        };
      }

      const updated = await db.companyBank.update({
        where: { id: bank.id },
        data: { is_active: !bank.is_active },
      });

      return {
        success: true,
        message: "Status bank berhasil diupdate",
        data: updated,
      };
    } catch (error: any) {
      console.error("Toggle company bank error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .delete("/:id", async ({ params, db, set }) => {
    try {
      await db.companyBank.delete({
        where: { id: parseInt(params.id) },
      });

      return {
        success: true,
        message: "Bank berhasil dihapus",
      };
    } catch (error: any) {
      console.error("Delete company bank error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
      })
  )
  .group("/contacts", (app) =>
    app
      .use(superAdminMiddleware)
      // Contact Center Management
      .get("/", async ({ db, set }) => {
    try {
      const contacts = await db.contactCenter.findMany({
        orderBy: { sequence: "asc" },
      });

      return {
        success: true,
        data: contacts,
      };
    } catch (error: any) {
      console.error("Get contact centers error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .post("/", async ({ db, body, set }) => {
    try {
      const { title, number, type, sequence, is_active } = body as any;

      const contact = await db.contactCenter.create({
        data: {
          title,
          number,
          type,
          sequence: sequence !== undefined ? parseInt(sequence) : 1,
          is_active: is_active !== undefined ? Boolean(is_active) : true,
        },
      });

      return {
        success: true,
        message: "Kontak berhasil ditambahkan",
        data: contact,
      };
    } catch (error: any) {
      console.error("Create contact center error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .put("/:id", async ({ params, db, body, set }) => {
    try {
      const { title, number, type, sequence, is_active } = body as any;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (number !== undefined) updateData.number = number;
      if (type !== undefined) updateData.type = type;
      if (sequence !== undefined) updateData.sequence = parseInt(sequence);
      if (is_active !== undefined) updateData.is_active = Boolean(is_active);

      const contact = await db.contactCenter.update({
        where: { id: parseInt(params.id) },
        data: updateData,
      });

      return {
        success: true,
        message: "Kontak berhasil diupdate",
        data: contact,
      };
    } catch (error: any) {
      console.error("Update contact center error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .put("/:id/toggle", async ({ params, db, set }) => {
    try {
      const contact = await db.contactCenter.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!contact) {
        set.status = 404;
        return {
          success: false,
          message: "Kontak tidak ditemukan",
        };
      }

      const updated = await db.contactCenter.update({
        where: { id: contact.id },
        data: { is_active: !contact.is_active },
      });

      return {
        success: true,
        message: "Status kontak berhasil diupdate",
        data: updated,
      };
    } catch (error: any) {
      console.error("Toggle contact center error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      .delete("/:id", async ({ params, db, set }) => {
    try {
      await db.contactCenter.delete({
        where: { id: parseInt(params.id) },
      });

      return {
        success: true,
        message: "Kontak berhasil dihapus",
      };
    } catch (error: any) {
      console.error("Delete contact center error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
      })
  )
  .group("/tasks", (app) =>
    app
      .use(superAdminMiddleware)
      // Task Management - Get all tasks
      .get("/", async ({ db, set }) => {
    try {
      const tasks = await db.taskConfig.findMany({
        orderBy: { sequence: "asc" },
      });

      return {
        success: true,
        data: tasks,
      };
    } catch (error: any) {
      console.error("Get tasks error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      // Task Management - Get task by id
      .get("/:id", async ({ params, db, set }) => {
    try {
      const task = await db.taskConfig.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!task) {
        set.status = 404;
        return {
          success: false,
          message: "Task tidak ditemukan",
        };
      }

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      console.error("Get task error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Task Management - Initialize 20 default tasks
  .post("/tasks/initialize", async ({ db, set }) => {
    try {
      // Check if tasks already exist
      const existingCount = await db.taskConfig.count();
      if (existingCount > 0) {
        set.status = 400;
        return {
          success: false,
          message: "Tasks sudah di-initialize. Gunakan update untuk mengubah task.",
        };
      }

      // Create 20 default tasks
      const defaultTasks = Array.from({ length: 20 }, (_, i) => ({
        sequence: i + 1,
        title: `Task ${i + 1}`,
        description: `Selesaikan task ${i + 1}`,
        target_url: `tllapp://view/task/${i + 1}`,
        is_active: true,
      }));

      await db.taskConfig.createMany({
        data: defaultTasks,
      });

      return {
        success: true,
        message: "20 tasks berhasil di-initialize",
      };
    } catch (error: any) {
      console.error("Initialize tasks error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
      // Task Management - Update task
      .put("/:id", async ({ params, body, db, set }) => {
    try {
      const { title, description, target_url, icon_url, is_active } = body as any;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (target_url !== undefined) updateData.target_url = target_url;
      if (icon_url !== undefined) updateData.icon_url = icon_url;
      if (is_active !== undefined) updateData.is_active = is_active;

      const task = await db.taskConfig.update({
        where: { id: parseInt(params.id) },
        data: updateData,
      });

      return {
        success: true,
        message: "Task berhasil diupdate",
        data: task,
      };
    } catch (error: any) {
      console.error("Update task error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
      })
      // Task Management - Upload icon
      .post("/:id/upload-icon", async ({ params, body, db, set }) => {
    try {
      const { icon_base64 } = body as any;

      if (!icon_base64) {
        set.status = 400;
        return {
          success: false,
          message: "Icon image is required",
        };
      }

      // Check if task exists
      const task = await db.taskConfig.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!task) {
        set.status = 404;
        return {
          success: false,
          message: "Task tidak ditemukan",
        };
      }

      // Decode base64 image
      const base64Data = icon_base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Determine file extension from base64 header
      let extension = "png"; // default
      if (icon_base64.startsWith("data:image/jpeg")) extension = "jpg";
      if (icon_base64.startsWith("data:image/jpg")) extension = "jpg";
      if (icon_base64.startsWith("data:image/png")) extension = "png";
      if (icon_base64.startsWith("data:image/gif")) extension = "gif";
      if (icon_base64.startsWith("data:image/webp")) extension = "webp";

      // Generate filename
      const timestamp = Date.now();
      const filename = `task-${params.id}-${timestamp}.${extension}`;

      // Ensure directory exists
      const uploadDir = join(process.cwd(), "public", "uploads", "task-icons");
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Save file
      const filePath = join(uploadDir, filename);
      writeFileSync(filePath, buffer);

      // Update task with new icon URL
      const iconUrl = `/uploads/task-icons/${filename}`;
      const updatedTask = await db.taskConfig.update({
        where: { id: parseInt(params.id) },
        data: { icon_url: iconUrl },
      });

      return {
        success: true,
        message: "Icon berhasil diupload",
        data: {
          icon_url: iconUrl,
          task: updatedTask,
        },
      };
    } catch (error: any) {
      console.error("Upload icon error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan saat upload icon",
      };
    }
      })
  )
  // ===== ADMIN MANAGEMENT (SUPER ADMIN ONLY) =====
  .group("/admins", (app) =>
    app
      .use(superAdminMiddleware)
      // List all admins
      .get("/", async ({ db, set }) => {
        try {
          const admins = await db.user.findMany({
            where: { is_admin: true },
            select: {
              id: true,
              username: true,
              email: true,
              is_admin: true,
              admin_role: true,
              created_at: true,
            },
            orderBy: { created_at: "desc" },
          });

          return {
            success: true,
            data: admins,
          };
        } catch (error: any) {
          console.error("Get admins error:", error);
          set.status = 500;
          return {
            success: false,
            message: "Terjadi kesalahan",
          };
        }
      })
      // Create new admin
      .post("/", async ({ body, db, set }) => {
        try {
          const { email, password, admin_role } = body as any;

          // Validate input
          if (!email || !password) {
            set.status = 400;
            return {
              success: false,
              message: "Email dan password wajib diisi",
            };
          }

          if (password.length < 6) {
            set.status = 400;
            return {
              success: false,
              message: "Password minimal 6 karakter",
            };
          }

          if (admin_role && !["SUPER_ADMIN", "ADMIN"].includes(admin_role)) {
            set.status = 400;
            return {
              success: false,
              message: "Role harus SUPER_ADMIN atau ADMIN",
            };
          }

          // Check if email already exists
          const existingUser = await db.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            set.status = 400;
            return {
              success: false,
              message: "Email sudah terdaftar",
            };
          }

          // Generate username from email
          const username = email.split("@")[0];

          // Hash password
          const hashedPassword = await Bun.password.hash(password, {
            algorithm: "argon2id",
          });

          // Create admin user
          const admin = await db.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
              is_admin: true,
              admin_role: admin_role || "ADMIN",
              is_active: true,
              tier_level: 0,
            },
            select: {
              id: true,
              username: true,
              email: true,
              is_admin: true,
              admin_role: true,
              created_at: true,
            },
          });

          // Create wallet for admin (required by schema)
          await db.wallet.create({
            data: {
              user_id: admin.id,
            },
          });

          return {
            success: true,
            message: "Admin berhasil dibuat",
            data: admin,
          };
        } catch (error: any) {
          console.error("Create admin error:", error);
          set.status = 500;
          return {
            success: false,
            message: "Terjadi kesalahan",
          };
        }
      })
      // Update admin role
      .put("/:id", async ({ params, body, db, set }) => {
        try {
          const { admin_role } = body as any;

          if (!admin_role || !["SUPER_ADMIN", "ADMIN"].includes(admin_role)) {
            set.status = 400;
            return {
              success: false,
              message: "Role harus SUPER_ADMIN atau ADMIN",
            };
          }

          const admin = await db.user.update({
            where: { id: params.id },
            data: { admin_role },
            select: {
              id: true,
              username: true,
              email: true,
              is_admin: true,
              admin_role: true,
              created_at: true,
            },
          });

          return {
            success: true,
            message: "Role admin berhasil diupdate",
            data: admin,
          };
        } catch (error: any) {
          console.error("Update admin error:", error);
          set.status = 500;
          return {
            success: false,
            message: "Terjadi kesalahan",
          };
        }
      })
      // Delete admin
      .delete("/:id", async ({ params, db, set, adminId }) => {
        try {
          // Prevent deleting self
          if (params.id === adminId) {
            set.status = 400;
            return {
              success: false,
              message: "Tidak dapat menghapus akun sendiri",
            };
          }

          await db.user.delete({
            where: { id: params.id },
          });

          return {
            success: true,
            message: "Admin berhasil dihapus",
          };
        } catch (error: any) {
          console.error("Delete admin error:", error);
          set.status = 500;
          return {
            success: false,
            message: "Terjadi kesalahan",
          };
        }
      })
  );

