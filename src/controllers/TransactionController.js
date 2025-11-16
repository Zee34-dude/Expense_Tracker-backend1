import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


class TransactionsController {


    getAllTransactions = async (req, res) => {
        try {
            const { type, startDate, endDate } = req.query;
            const user_uid = req.user.uid;

            // Find SQL user
            const user = await prisma.user.findUnique({
                where: { user_uid }
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const filters = { userId: user.id };

            if (type) filters.type = type;

            if (startDate && endDate) {
                filters.date = {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                };
            }

            const transactions = await prisma.transaction.findMany({
                where: filters,
                include: {
                    category: true,
                    account: true,
                },
                orderBy: { date: "desc" },
            });

            res.json(transactions);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            res.status(500).json({ error: "Failed to fetch transactions" });
        }
    };


    addTransaction = async (req, res) => {
        const user_uid = req.user.uid;

        // 2️⃣ Look up your SQL User ID
        const user = await prisma.user.findUnique({
            where: { user_uid } // assuming you store Firebase UID in your User table
        });

        if (!user) {
            return res.status(400).json({ error: "User not found in database" });
        }

        // 3️⃣ Use SQL user ID in transaction
        const userId = user.id; // this is your database primary key
        try {
            const { type, amount, categoryId, accountId, date, description } = req.body;


            if (!type || !amount || !categoryId || !accountId || !date) {
                return res.status(400).json({ error: "All required fields must be filled" });
            }

            const newTransaction = await prisma.transaction.create({
                data: {
                    userId,
                    type,
                    amount: parseFloat(amount),
                    categoryId,
                    accountId,
                    date: new Date(date),
                    description,
                },
            });

            res.status(201).json({
                message: `${type} transaction added successfully`,
                transaction: newTransaction,
            });
        } catch (error) {
            console.log("Error adding transaction:", error);
            res.status(500).json({ error: "Failed to add transaction" });
        }
    };

    updateTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { type, amount, category, account, date, description } = req.body;
            const userId = req.user.uid;

            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: Number(id) },
            });

            if (!existingTransaction || existingTransaction.userId !== userId) {
                return res.status(404).json({ error: "Transaction not found" });
            }

            const updatedTransaction = await prisma.transaction.update({
                where: { id: Number(id) },
                data: {
                    type,
                    amount: parseFloat(amount),
                    category,
                    account,
                    date: new Date(date),
                    description,
                },
            });

            res.json({
                message: "Transaction updated successfully",
                transaction: updatedTransaction,
            });
        } catch (error) {
            console.error("Error updating transaction:", error);
            res.status(500).json({ error: "Failed to update transaction" });
        }
    };

    deleteTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.uid;

            const transaction = await prisma.transaction.findUnique({
                where: { id: Number(id) },
            });

            if (!transaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }

            await prisma.transaction.delete({
                where: { id: Number(id) },
            });

            res.json({ message: "Transaction deleted successfully" });
        } catch (error) {
            console.error("Error deleting transaction:", error);
            res.status(500).json({ error: "Failed to delete transaction" });
        }
    };

    getSummary = async (req, res) => {
        try {
            const user_uid = req.user.uid;

            // Find SQL user
            const user = await prisma.user.findUnique({
                where: { user_uid }
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const userId = user.id

            const income = await prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { userId, type: "INCOME" },
            });

            const expense = await prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { userId, type: "EXPENSE" },
            });

            const totalIncome = income._sum.amount || 0;
            const totalExpense = expense._sum.amount || 0;
            const balance = totalIncome - totalExpense;

            res.json({ totalIncome, totalExpense, balance });
        } catch (error) {
            console.error("Error getting summary:", error);
            res.status(500).json({ error: "Failed to fetch summary" });
        }
    };
    getMonthlySummary = async (req, res) => {
        try {

            const user_uid = req.user.uid;

            // Find SQL user
            const user = await prisma.user.findUnique({
                where: { user_uid }
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const userId = user.id; // Your Prisma User ID

            // Fetch all user's transactions
            const transactions = await prisma.transaction.findMany({
                where: { userId },
                select: {
                    amount: true,
                    type: true, // INCOME or EXPENSE
                    date: true,
                },
            });

            // Prepare monthly map
            const summaryMap = {};

            transactions.forEach((tx) => {
                const month = tx.date.toLocaleString("en-US", { month: "short" }); // Jan, Feb...

                if (!summaryMap[month]) {
                    summaryMap[month] = { income: 0, expense: 0 };
                }

                if (tx.type === "INCOME") {
                    summaryMap[month].income += tx.amount;
                } else if (tx.type === "EXPENSE") {
                    summaryMap[month].expense += tx.amount;
                }
            });

            // Convert map to array sorted by month order
            const orderedMonths = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            const result = orderedMonths
                .filter((m) => summaryMap[m]) // only months with data
                .map((m) => ({
                    name: m,
                    Income: summaryMap[m].income,
                    Expense: summaryMap[m].expense,
                }));

            return res.json(result);

        } catch (error) {
            console.error("Monthly Summary Error:", error);
            return res.status(500).json({ error: "Failed to fetch monthly summary" });
        }
    };

}
export default TransactionsController



