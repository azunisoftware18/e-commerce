-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryid_fkey`;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_categoryid_fkey, onDelete:Cascade` FOREIGN KEY (`categoryid`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
