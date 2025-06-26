/*
  Warnings:

  - The primary key for the `nfe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `nfe_codigo` on the `nfe` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - Added the required column `nfe_id` to the `nfe_produtos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `nfe_evento` DROP FOREIGN KEY `fk_nfe_evento_nfe`;

-- DropForeignKey
ALTER TABLE `nfe_produtos` DROP FOREIGN KEY `fk_nfe_produtos_nfe1`;

-- AlterTable
ALTER TABLE `nfe` DROP PRIMARY KEY,
    MODIFY `nfe_codigo` TINYINT NOT NULL;

-- AlterTable
ALTER TABLE `nfe_evento` MODIFY `id_nfe` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `nfe_produtos` ADD COLUMN `nfe_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `fk_nfe_produtos_nfe1` ON `nfe_produtos`(`nfe_id`);

-- AddForeignKey
ALTER TABLE `nfe_evento` ADD CONSTRAINT `fk_nfe_evento_nfe` FOREIGN KEY (`id_nfe`) REFERENCES `nfe`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe_produtos` ADD CONSTRAINT `fk_nfe_produtos_nfe1` FOREIGN KEY (`nfe_id`) REFERENCES `nfe`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `nfe_evento` RENAME INDEX `fk_nfe_evento_nfe_idx` TO `fk_nfe_evento_nfe`;
