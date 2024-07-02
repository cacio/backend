/*
  Warnings:

  - The primary key for the `empresa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nome` on the `empresa` table. All the data in the column will be lost.
  - You are about to alter the column `cnpj` on the `empresa` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `VarChar(14)`.

*/
-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `fk_usuario_empresa1`;

-- AlterTable
ALTER TABLE `empresa` DROP PRIMARY KEY,
    DROP COLUMN `nome`,
    ADD COLUMN `cep` CHAR(8) NULL,
    ADD COLUMN `cmun` INTEGER NULL,
    ADD COLUMN `cnae` VARCHAR(7) NULL,
    ADD COLUMN `cpais` CHAR(4) NULL,
    ADD COLUMN `cpf` VARCHAR(11) NULL,
    ADD COLUMN `crt` INTEGER NULL,
    ADD COLUMN `enderemit` TEXT NULL,
    ADD COLUMN `fone` CHAR(14) NULL,
    ADD COLUMN `ie` VARCHAR(14) NULL,
    ADD COLUMN `iest` VARCHAR(14) NULL,
    ADD COLUMN `im` VARCHAR(15) NULL,
    ADD COLUMN `nro` VARCHAR(60) NULL,
    ADD COLUMN `uf` VARCHAR(2) NULL,
    ADD COLUMN `xbairro` VARCHAR(60) NULL,
    ADD COLUMN `xcpl` VARCHAR(60) NULL,
    ADD COLUMN `xfant` VARCHAR(60) NULL,
    ADD COLUMN `xlgr` VARCHAR(60) NULL,
    ADD COLUMN `xmun` VARCHAR(60) NULL,
    ADD COLUMN `xnome` VARCHAR(60) NULL,
    ADD COLUMN `xpais` VARCHAR(60) NULL,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `cnpj` VARCHAR(14) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `usuario` MODIFY `idemp` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `fk_usuario_empresa1` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
