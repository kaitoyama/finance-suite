/*
  Warnings:

  - Added the required column `direction` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `direction` ENUM('IN', 'OUT') NOT NULL,
    ADD COLUMN `expenseRequestId` INTEGER NULL,
    ADD COLUMN `method` ENUM('BANK', 'CASH', 'OTHER') NOT NULL;

-- CreateTable
CREATE TABLE `PaymentAttachment` (
    `paymentId` INTEGER NOT NULL,
    `attachmentId` INTEGER NOT NULL,

    PRIMARY KEY (`paymentId`, `attachmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_expenseRequestId_fkey` FOREIGN KEY (`expenseRequestId`) REFERENCES `ExpenseRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentAttachment` ADD CONSTRAINT `PaymentAttachment_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentAttachment` ADD CONSTRAINT `PaymentAttachment_attachmentId_fkey` FOREIGN KEY (`attachmentId`) REFERENCES `Attachment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
