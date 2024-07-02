/*
  Warnings:

  - You are about to alter the column `created_at` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(6)` to `Timestamp(0)`.
  - You are about to alter the column `updated_at` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(6)` to `Timestamp(0)`.

*/
-- AlterTable
ALTER TABLE `usuario` MODIFY `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);
