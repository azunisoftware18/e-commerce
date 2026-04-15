-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('Admin', 'Customer') NOT NULL DEFAULT 'Customer',
    `status` ENUM('Active', 'Inactive') NOT NULL,
    `phone` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `totalSpent` DECIMAL(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NULL,
    `token` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `image` VARCHAR(191) NULL,
    `createdby` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Category_sku_key`(`sku`),
    INDEX `Category_createdby_fkey`(`createdby`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` LONGTEXT,
    `categoryid` VARCHAR(191) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `stock` INTEGER NOT NULL,
    `status` ENUM('Active', 'Out_of_Stock', 'Discontinued') NOT NULL,
    `createdby` VARCHAR(191) NOT NULL,

    INDEX `Product_categoryid_fkey`(`categoryid`),
    INDEX `Product_createdby_fkey`(`createdby`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productimage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `ProductImage_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` VARCHAR(191) NOT NULL,
    `customerid` VARCHAR(191) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('Pending', 'Processing', 'Delivered', 'Cancelled', 'Shipped') NULL DEFAULT 'Pending',
    `payment` ENUM('Processing', 'Cancelled', 'Paid', 'Pending', 'Refunded') NULL DEFAULT 'Pending',
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duedate` DATETIME(3) NULL,
    `createdby` VARCHAR(191) NOT NULL,
    `shippingId` VARCHAR(191) NOT NULL,
    `payment_mode` VARCHAR(191) NOT NULL DEFAULT 'COD',
    `transaction_id` VARCHAR(191) NULL,
    `merchant_order_id` VARCHAR(191) NULL,
    `bank_reference_id` VARCHAR(191) NULL,

    INDEX `Order_createdby_fkey`(`createdby`),
    INDEX `Order_customerid_fkey`(`customerid`),
    INDEX `Order_shippingId_fkey`(`shippingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shippingaddress` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `zip` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderitem` (
    `id` VARCHAR(191) NOT NULL,
    `orderid` VARCHAR(191) NOT NULL,
    `productid` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,

    INDEX `OrderItem_orderid_fkey`(`orderid`),
    INDEX `OrderItem_productid_fkey`(`productid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `Category_createdby_fkey` FOREIGN KEY (`createdby`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_categoryid_fkey` FOREIGN KEY (`categoryid`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_createdby_fkey` FOREIGN KEY (`createdby`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productimage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `Order_createdby_fkey` FOREIGN KEY (`createdby`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `Order_customerid_fkey` FOREIGN KEY (`customerid`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `Order_shippingId_fkey` FOREIGN KEY (`shippingId`) REFERENCES `shippingaddress`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `OrderItem_orderid_fkey` FOREIGN KEY (`orderid`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `OrderItem_productid_fkey` FOREIGN KEY (`productid`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
