import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/UserRoutes.js";
import transactionsRoutes from "./routes/TransactionRoute.js";
import verifyToken from "./middleware/authMiddleware.js";
import accountRoutes from "./routes/AccountRoute.js";
import budgetRoutes from "./routes/BudgetRoutes.js";
import categoriesRoutes from "./routes/CategoriesRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use('/api/transactions',verifyToken, transactionsRoutes)
app.use('/api/account',verifyToken,accountRoutes)
app.use('/api/budget',verifyToken,budgetRoutes)
app.use('/api/categories',verifyToken,categoriesRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
