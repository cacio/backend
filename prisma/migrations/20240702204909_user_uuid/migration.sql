/*
  Warnings:

  - The primary key for the `usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `usuario` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);
