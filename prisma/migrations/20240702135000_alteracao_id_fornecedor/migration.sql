/*
  Warnings:

  - The primary key for the `fornecedor` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `fornecedor` DROP PRIMARY KEY,
    MODIFY `codigo` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`codigo`);
