/*
  Warnings:

  - You are about to drop the column `userId` on the `account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropIndex
DROP INDEX `Account_userId_fkey` ON `account`;

-- AlterTable
ALTER TABLE `account` DROP COLUMN `userId`;
