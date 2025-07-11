/*
  Warnings:

  - The primary key for the `nfe_produtos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `codigo` on the `nfe_produtos` table. All the data in the column will be lost.
  - The required column `id` was added to the `nfe_produtos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `nfe_produtos` DROP PRIMARY KEY,
    DROP COLUMN `codigo`,
    ADD COLUMN `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);
