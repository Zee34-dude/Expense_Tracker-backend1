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
      const userId = req.user.uid;

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
      const userId = req.user.uid;
      const { categoryId, amount, period } = req.body;

      if (!categoryId || !amount || !period) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const budget = await prisma.budget.create({
        data: {
          categoryId: Number(categoryId),
          amount,
          period,        // "MONTHLY" | "WEEKLY"
          userId,
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
      const { amount, period } = req.body;

      const old = await prisma.budget.findUnique({
        where: { id: Number(id) }
      });

      if (!old || old.userId !== userId) {
        return res.status(404).json({ error: "Budget not found" });
      }

      const updated = await prisma.budget.update({
        where: { id: Number(id) },
        data: { amount, period },
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
