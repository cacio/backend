-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `fk_usuario_empresa1`;

-- CreateTable
CREATE TABLE `UsuarioEmpresa` (
    `usuarioId` VARCHAR(191) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`usuarioId`, `empresaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsuarioEmpresa` ADD CONSTRAINT `UsuarioEmpresa_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEmpresa` ADD CONSTRAINT `UsuarioEmpresa_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
