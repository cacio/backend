-- CreateTable
CREATE TABLE `ConfiguracaoNFe` (
    `id` VARCHAR(36) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,
    `tpAmb` INTEGER NOT NULL,
    `versao` VARCHAR(191) NOT NULL,
    `certPfx` LONGBLOB NOT NULL,
    `certPassword` VARCHAR(191) NOT NULL,
    `mailFrom` VARCHAR(191) NOT NULL,
    `mailSmtp` VARCHAR(191) NOT NULL,
    `mailUser` VARCHAR(191) NOT NULL,
    `mailPass` VARCHAR(191) NOT NULL,
    `mailProtocol` VARCHAR(191) NOT NULL,
    `mailPort` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ConfiguracaoNFe_empresaId_key`(`empresaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConfiguracaoNFe` ADD CONSTRAINT `ConfiguracaoNFe_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
