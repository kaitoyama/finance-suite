-- AlterTable
ALTER TABLE `Invoice` MODIFY `status` ENUM('DRAFT', 'UNPAID', 'PARTIAL', 'PAID', 'OVERPAY') NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `overpaidAmount` DECIMAL(12, 2) NULL;
