-- AlterTable
ALTER TABLE `usuario_configuracao` ADD COLUMN `idemp` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `usuario_configuracao` ADD CONSTRAINT `fk_usuario_configuracao_empresa` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
