-- DropIndex
DROP INDEX `fk_nfe_produtos_nfe1_idx` ON `nfe_produtos`;

-- CreateTable
CREATE TABLE `tab_duplicata` (
    `id` VARCHAR(36) NOT NULL,
    `numero_nota` VARCHAR(45) NULL,
    `numero_duplicata` VARCHAR(45) NULL,
    `data_emissao` DATE NULL,
    `data_vencimento` DATE NULL,
    `valor_duplicata` FLOAT NULL,
    `valor_nota` FLOAT NULL,
    `forma_pagto` VARCHAR(45) NULL,
    `nosso_numero` VARCHAR(45) NULL,
    `nfe_id` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_nfe_produtos_nfe2`(`nfe_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tab_duplicata` ADD CONSTRAINT `fk_nfe_produtos_nfe2` FOREIGN KEY (`nfe_id`) REFERENCES `nfe`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `nfe` RENAME INDEX `fk_nfe_empresa1_idx` TO `fk_nfe_empresa1`;
