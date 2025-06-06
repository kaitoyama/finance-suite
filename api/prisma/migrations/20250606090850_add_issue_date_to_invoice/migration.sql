-- Add issueDate field to Invoice
ALTER TABLE `Invoice` ADD COLUMN `issueDate` DATETIME NOT NULL DEFAULT NOW();
