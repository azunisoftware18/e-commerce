/*
  Warnings:

  - Added the required column `type` to the `DietPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dietplan` ADD COLUMN `type` ENUM('FREE', 'PAID') NOT NULL;
