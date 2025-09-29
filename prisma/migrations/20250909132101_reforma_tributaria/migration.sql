-- AlterTable
ALTER TABLE `cfop_natura` ADD COLUMN `CSTIBSCBS_padrao` VARCHAR(2) NULL DEFAULT '04',
    ADD COLUMN `CSTIS_padrao` VARCHAR(2) NULL DEFAULT '04',
    ADD COLUMN `aliquotaCBS_cfop` DECIMAL(5, 4) NULL,
    ADD COLUMN `aliquotaIBS_cfop` DECIMAL(5, 4) NULL,
    ADD COLUMN `aliquotaIS_cfop` DECIMAL(5, 4) NULL,
    ADD COLUMN `aplicaIBSCBS` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `aplicaIS` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `empresa` ADD COLUMN `ativaReformaTributaria` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `dataInicioReformaTributaria` DATE NULL;

-- AlterTable
ALTER TABLE `nfe` ADD COLUMN `chaveNFeReferenciada` VARCHAR(44) NULL,
    ADD COLUMN `finNFeComp` VARCHAR(1) NULL DEFAULT '0',
    ADD COLUMN `nItemReferenciado` INTEGER NULL,
    ADD COLUMN `vTotalCBS` DECIMAL(15, 2) NULL DEFAULT 0.00,
    ADD COLUMN `vTotalCredPres` DECIMAL(15, 2) NULL DEFAULT 0.00,
    ADD COLUMN `vTotalIBS` DECIMAL(15, 2) NULL DEFAULT 0.00,
    ADD COLUMN `vTotalIS` DECIMAL(15, 2) NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `produtos` ADD COLUMN `CClassTribIBSCBS` VARCHAR(8) NULL,
    ADD COLUMN `CClassTribIS` VARCHAR(8) NULL,
    ADD COLUMN `CCredPresCBS` VARCHAR(2) NULL,
    ADD COLUMN `CCredPresIBS` VARCHAR(2) NULL,
    ADD COLUMN `CSTIBSCBS` VARCHAR(2) NULL DEFAULT '04',
    ADD COLUMN `CSTIS` VARCHAR(2) NULL DEFAULT '04',
    ADD COLUMN `aliquotaCBS` DECIMAL(5, 4) NULL DEFAULT 0.0000,
    ADD COLUMN `aliquotaIBS` DECIMAL(5, 4) NULL DEFAULT 0.0000,
    ADD COLUMN `aliquotaIS` DECIMAL(5, 4) NULL DEFAULT 0.0000,
    ADD COLUMN `pCredPresCBS` DECIMAL(5, 4) NULL,
    ADD COLUMN `pCredPresIBS` DECIMAL(5, 4) NULL,
    ADD COLUMN `sujeitoIBSCBS` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `sujeitoIS` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `vCBSCredPres` DECIMAL(15, 2) NULL,
    ADD COLUMN `vDifCBS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vDifIBS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vDifIS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vIBSCredPres` DECIMAL(15, 2) NULL,
    ADD COLUMN `vMonoCBS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vMonoIBS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vMonoIS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vRetCBS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vRetIBS` DECIMAL(15, 2) NULL,
    ADD COLUMN `vRetIS` DECIMAL(15, 2) NULL;

-- CreateTable
CREATE TABLE `classificacao_tributaria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(8) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('IS', 'IBS_CBS') NOT NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `data_criacao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_atualizacao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `classificacao_tributaria_codigo_key`(`codigo`),
    INDEX `idx_codigo`(`codigo`),
    INDEX `idx_tipo`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credito_presumido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(2) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('IBS', 'CBS') NOT NULL,
    `percentual_padrao` DECIMAL(5, 4) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `data_criacao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_atualizacao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tipo`(`tipo`),
    UNIQUE INDEX `uk_codigo_tipo`(`codigo`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
