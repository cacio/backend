/*
  Warnings:

  - You are about to drop the column `idemp` on the `usuario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `fk_usuario_empresa1_idx` ON `usuario`;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `idemp`;
