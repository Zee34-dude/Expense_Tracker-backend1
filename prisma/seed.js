import { PrismaClient,TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const categories = [
        // INCOME
        { name: "Salary", type: TransactionType.INCOME },
        { name: "Business", type: TransactionType.INCOME },
        { name: "Investments", type: TransactionType.INCOME },
        { name: "Gift Income", type: TransactionType.INCOME },

        // EXPENSE
        { name: "Food & Groceries", type: TransactionType.EXPENSE },
        { name: "Transportation", type: TransactionType.EXPENSE },
        { name: "Bills & Utilities", type: TransactionType.EXPENSE },
        { name: "Shopping", type: TransactionType.EXPENSE },
        { name: "Health", type: TransactionType.EXPENSE },
        { name: "Entertainment", type: TransactionType.EXPENSE },
        { name: "Education", type: TransactionType.EXPENSE },
        { name: "Family & Personal", type: TransactionType.EXPENSE },
        { name: "Debt & Loans", type: TransactionType.EXPENSE }
    ];

    console.log("🌱 Seeding categories...");


    await prisma.category.createMany({
        data: categories,
        skipDuplicates: true, // skips if name already exists
    });


    console.log("✅ Categories seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
