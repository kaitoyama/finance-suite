/*
  Warnings:

  - You are about to alter the column `amount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Double`.
  - You are about to alter the column `status` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(2))`.
  - Added the required column `createdById` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Made the column `pdfKey` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `dueDate` DATETIME(3) NOT NULL,
    MODIFY `amount` DOUBLE NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'UNPAID', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'UNPAID',
    MODIFY `pdfKey` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
