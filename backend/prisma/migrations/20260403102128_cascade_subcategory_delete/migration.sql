-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `product_subCategoryId_fkey`;

-- DropIndex
DROP INDEX `product_subCategoryId_fkey` ON `product`;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `SubCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
