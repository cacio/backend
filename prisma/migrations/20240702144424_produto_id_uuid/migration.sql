/*
  Warnings:

  - The primary key for the `nfe_produtos` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `nfe_produtos` DROP PRIMARY KEY,
    MODIFY `codigo` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`codigo`);
