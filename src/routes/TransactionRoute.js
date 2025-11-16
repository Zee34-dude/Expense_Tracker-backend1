import express from 'express'
import TransactionsController from "../controllers/TransactionController.js";

const transactionsController = new TransactionsController()
const router = express.Router()



router.get("/", transactionsController.getAllTransactions);
router.get("/monthly-summary",  transactionsController.getMonthlySummary);
router.post("/", transactionsController.addTransaction);
router.put("/:id", transactionsController.updateTransaction);
router.delete("/:id", transactionsController.deleteTransaction);
router.get("/summary", transactionsController.getSummary);

export default router;