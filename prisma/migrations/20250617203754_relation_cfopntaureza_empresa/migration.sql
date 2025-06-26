-- AddForeignKey
ALTER TABLE `cfop_natura` ADD CONSTRAINT `fk_cfop_natura_empresa1` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
