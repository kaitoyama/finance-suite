/*
  Warnings:

  - You are about to drop the column `attachmentId` on the `ExpenseRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ExpenseRequest` DROP FOREIGN KEY `ExpenseRequest_attachmentId_fkey`;

-- DropIndex
DROP INDEX `Attachment_expenseRequestId_key` ON `Attachment`;

-- DropIndex
DROP INDEX `ExpenseRequest_attachmentId_key` ON `ExpenseRequest`;

-- AlterTable
ALTER TABLE `ExpenseRequest` DROP COLUMN `attachmentId`;

-- AlterTable
ALTER TABLE `Invoice` MODIFY `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_expenseRequestId_fkey` FOREIGN KEY (`expenseRequestId`) REFERENCES `ExpenseRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
