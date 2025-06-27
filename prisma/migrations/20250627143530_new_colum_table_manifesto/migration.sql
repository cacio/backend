-- AlterTable
ALTER TABLE `tb_manifestos` ADD COLUMN `codrepresentante` VARCHAR(10) NULL,
    ADD COLUMN `idemp` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `fk_tb_manifestos_empresa` ON `tb_manifestos`(`idemp`);

-- AddForeignKey
ALTER TABLE `tb_manifestos` ADD CONSTRAINT `fk_tb_manifestos_empresa` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
