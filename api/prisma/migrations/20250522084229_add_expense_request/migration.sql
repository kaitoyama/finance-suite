/*
  Warnings:

  - A unique constraint covering the columns `[expenseRequestId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ExpenseRequest` ADD COLUMN `paymentId` INTEGER NULL,
    MODIFY `state` ENUM('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX `Payment_expenseRequestId_key` ON `Payment`(`expenseRequestId`);
