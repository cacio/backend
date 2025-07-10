-- CreateTable
CREATE TABLE `usuario_configuracao` (
    `id` VARCHAR(36) NOT NULL,
    `usuarioId` VARCHAR(36) NOT NULL,
    `serie` VARCHAR(10) NULL,
    `cfop` VARCHAR(10) NULL,
    `numeroviaempressao` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario_configuracao` ADD CONSTRAINT `usuario_configuracao` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
