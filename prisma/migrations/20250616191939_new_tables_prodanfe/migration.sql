/*
  Warnings:

  - The primary key for the `cfop_natura` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `cidade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `duplic_receber` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ncm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `nfe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `nfe_evento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `nosso_numero` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pais` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `preco_produto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sequencia_boleto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tb_manifestos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `unidade_medida` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `veiculos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `banco` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bancos_atv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `benificiario_emitente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `boletos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cfop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emitente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submenu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tab_duplicata` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `nfe` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `nfe` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX `nfe_nfe_codigo_key` ON `nfe`;

-- AlterTable
ALTER TABLE `cfop_natura` DROP PRIMARY KEY,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `cidade` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `duplic_receber` DROP PRIMARY KEY,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `idemp` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ncm` DROP PRIMARY KEY,
    MODIFY `codigo` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`codigo`);

-- AlterTable
ALTER TABLE `nfe` DROP PRIMARY KEY,
    ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id` VARCHAR(36) NOT NULL,
    ADD COLUMN `nfe_serie` VARCHAR(3) NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `fornecedor_codigo` VARCHAR(36) NOT NULL,
    MODIFY `nfe_natureza_operacao` VARCHAR(191) NULL,
    MODIFY `nfe_formpag` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`nfe_codigo`);

-- AlterTable
ALTER TABLE `nfe_evento` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `nfe_produtos` MODIFY `produtos_codigo` VARCHAR(191) NULL,
    MODIFY `nfe_cfop` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `nosso_numero` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `pais` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `preco_produto` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sequencia_boleto` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `tb_manifestos` DROP PRIMARY KEY,
    ADD COLUMN `chave_acesso` VARCHAR(44) NULL,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `unidade_medida` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `veiculos` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `banco`;

-- DropTable
DROP TABLE `bancos_atv`;

-- DropTable
DROP TABLE `benificiario_emitente`;

-- DropTable
DROP TABLE `boletos`;

-- DropTable
DROP TABLE `cfop`;

-- DropTable
DROP TABLE `emitente`;

-- DropTable
DROP TABLE `permissoes`;

-- DropTable
DROP TABLE `submenu`;

-- DropTable
DROP TABLE `tab_duplicata`;

-- CreateTable
CREATE TABLE `condicoes_pagamento` (
    `id` VARCHAR(36) NOT NULL,
    `codigo` VARCHAR(10) NULL,
    `descricao` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `nfe_id_key` ON `nfe`(`id`);

-- CreateIndex
CREATE INDEX `fk_nfe_condicoes_pagamento1` ON `nfe`(`nfe_formpag`);

-- CreateIndex
CREATE INDEX `fk_nfe_empresa1_idx` ON `nfe`(`idemp`);

-- CreateIndex
CREATE INDEX `fk_nfe_fornecedor1` ON `nfe`(`fornecedor_codigo`);

-- CreateIndex
CREATE INDEX `fk_nfe_cfop_natura1` ON `nfe`(`nfe_natureza_operacao`);

-- CreateIndex
CREATE INDEX `fk_nfe_produtos_produtos1` ON `nfe_produtos`(`produtos_codigo`);

-- CreateIndex
CREATE INDEX `fk_nfe_produtos_cfop_natura1` ON `nfe_produtos`(`nfe_cfop`);

-- AddForeignKey
ALTER TABLE `duplic_receber` ADD CONSTRAINT `fk_duplic_receber_fornecedor1` FOREIGN KEY (`cod_forc`) REFERENCES `fornecedor`(`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `duplic_receber` ADD CONSTRAINT `fk_duplic_receber_empresa1` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe` ADD CONSTRAINT `fk_nfe_fornecedor1` FOREIGN KEY (`fornecedor_codigo`) REFERENCES `fornecedor`(`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe` ADD CONSTRAINT `fk_nfe_condicoes_pagamento1` FOREIGN KEY (`nfe_formpag`) REFERENCES `condicoes_pagamento`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe` ADD CONSTRAINT `fk_nfe_empresa1` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe` ADD CONSTRAINT `fk_nfe_cfop_natura1` FOREIGN KEY (`nfe_natureza_operacao`) REFERENCES `cfop_natura`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe_produtos` ADD CONSTRAINT `fk_nfe_produtos_produtos1` FOREIGN KEY (`produtos_codigo`) REFERENCES `produtos`(`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe_produtos` ADD CONSTRAINT `fk_nfe_produtos_cfop_natura1` FOREIGN KEY (`nfe_cfop`) REFERENCES `cfop_natura`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
