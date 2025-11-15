/*
  Warnings:

  - You are about to drop the column `uid` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_uid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `usercategory` DROP FOREIGN KEY `UserCategory_userId_fkey`;

-- DropIndex
DROP INDEX `User_uid_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `uid`,
    ADD COLUMN `user_uid` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_user_uid_key` ON `User`(`user_uid`);

-- AddForeignKey
ALTER TABLE `UserCategory` ADD CONSTRAINT `UserCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_uid`) ON DELETE RESTRICT ON UPDATE CASCADE;
