import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class BudgetController {
  constructor() {
    this.getAllBudgets = this.getAllBudgets.bind(this);
    this.createBudget = this.createBudget.bind(this);
    this.updateBudget = this.updateBudget.bind(this);
    this.deleteBudget = this.deleteBudget.bind(this);
  }

  // GET /api/budgets
  async getAllBudgets(req, res) {
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

      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: "desc" }
      });

      return res.json(budgets);
    } catch (error) {
      console.error("Get Budgets Error:", error);
      return res.status(500).json({ error: "Failed to fetch budgets" });
    }
  }

  // POST /api/budgets
  async createBudget(req, res) {
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
      const { categoryId, amount, startDate, endDate, categoryName } = req.body;

      if (!categoryId || !amount || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const budget = await prisma.budget.create({
        data: {
          categoryId: Number(categoryId),
          limit: amount,
          startDate,
          endDate,        // "MONTHLY" | "WEEKLY"
          userId,
          name: categoryName
        },
      });

      return res.status(201).json({
        message: "Budget created",
        budget,
      });
    } catch (error) {
      console.error("Create Budget Error:", error);
      return res.status(500).json({ error: "Failed to create budget" });
    }
  }

  // PUT /api/budgets/:id
  async updateBudget(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const { amount, startDate } = req.body;

      const old = await prisma.budget.findUnique({
        where: { id: Number(id) }
      });

      if (!old || old.userId !== userId) {
        return res.status(404).json({ error: "Budget not found" });
      }

      const updated = await prisma.budget.update({
        where: { id: Number(id) },
        data: { amount, startDate },
      });

      return res.json({
        message: "Budget updated",
        budget: updated,
      });
    } catch (error) {
      console.error("Update Budget Error:", error);
      return res.status(500).json({ error: "Failed to update budget" });
    }
  }

  // GET /budgets/:id/spent
  getBudgetSpent = async (req, res) => {
    const user_uid = req.user.uid;

    // 2️⃣ Lookup the SQL user
    const user = await prisma.user.findUnique({
      where: { user_uid } // assuming you store Firebase UID in your User table
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const userId = user.id;
    const budgetId = Number(req.params.id);

    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    const spent = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId,
        categoryId: budget.categoryId,
        type: "EXPENSE",         // 🔥 Only expense transactions
        date: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      }
    });

    res.json({
      spent: spent._sum.amount || 0
    });
  };


  // DELETE /api/budgets/:id
  async deleteBudget(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;

      const old = await prisma.budget.findUnique({
        where: { id: Number(id) }
      });

      if (!old || old.userId !== userId) {
        return res.status(404).json({ error: "Budget not found" });
      }

      await prisma.budget.delete({
        where: { id: Number(id) }
      });

      return res.json({ message: "Budget deleted" });
    } catch (error) {
      console.error("Delete Budget Error:", error);
      return res.status(500).json({ error: "Failed to delete budget" });
    }
  }
}

export default BudgetController;
