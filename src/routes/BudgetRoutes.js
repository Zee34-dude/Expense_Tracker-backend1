import express from "express";
import BudgetController from "../controllers/BudgetController.js";

const router = express.Router();
const budgetController = new BudgetController();

router.get("/", budgetController.getAllBudgets);
router.post("/", budgetController.createBudget);
router.put("/:id", budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

export default router;
