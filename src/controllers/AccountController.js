import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class AccountController {
  constructor() {
    this.getAllAccounts = this.getAllAccounts.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }

  // GET /api/accounts
  async getAllAccounts(req, res) {
    try {
      const user_uid = req.user.uid;

      // 2️⃣ Lookup the SQL user
      const user = await prisma.user.findUnique({
        where: { user_uid } // assuming you store Firebase UID in your User table
      });

      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }

      const userId = user.id;

      const accounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });

      return res.json(accounts);
    } catch (error) {
      console.error("Get Accounts Error:", error);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }
  }

  // POST /api/accounts
  async createAccount(req, res) {
    try {
      const user_uid = req.user.uid;
      const { name, type, balance } = req.body;
      const user = await prisma.user.findUnique({
        where: { user_uid } // assuming you store Firebase UID in your User table
      });
      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }
      if (!user) {
        return res.status(400).json({ error: "User not found in database" });
      }

      const userId = user.id;

      const newAccount = await prisma.account.create({
        data: {
          name,
          type,     // "BANK" | "CASH" | "CARD"
          balance: balance || 0,
          userId,
        },
      });

      return res.status(201).json({
        message: "Account created",
        account: newAccount,
      });
    } catch (error) {
      console.error("Create Account Error:", error);
      return res.status(500).json({ error: "Failed to create account" });
    }
  }

  // PUT /api/accounts/:id
  async updateAccount(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const { name, type, balance } = req.body;

      const old = await prisma.account.findUnique({
        where: { id: Number(id) }
      });

      if (!old || old.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      const updated = await prisma.account.update({
        where: { id: Number(id) },
        data: { name, type, balance },
      });

      return res.json({
        message: "Account updated",
        account: updated,
      });
    } catch (error) {
      console.error("Update Account Error:", error);
      return res.status(500).json({ error: "Failed to update account" });
    }
  }

  // DELETE /api/accounts/:id
  async deleteAccount(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;

      const old = await prisma.account.findUnique({
        where: { id: Number(id) }
      });

      if (!old || old.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      await prisma.account.delete({
        where: { id: Number(id) }
      });

      return res.json({ message: "Account deleted" });
    } catch (error) {
      console.error("Delete Account Error:", error);
      return res.status(500).json({ error: "Failed to delete account" });
    }
  }
}

export default AccountController;
