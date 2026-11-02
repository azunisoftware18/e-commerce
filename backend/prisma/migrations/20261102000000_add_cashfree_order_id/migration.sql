-- Store the Cashfree gateway order ID for later payment verification.
ALTER TABLE `order` ADD COLUMN `cashfreeOrderId` VARCHAR(191) NULL;
