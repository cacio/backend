-- AlterTable
ALTER TABLE `condicoes_pagamento` ADD COLUMN `idemp` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `fk_condicoes_pagamento_empresa1` ON `condicoes_pagamento`(`idemp`);

-- AddForeignKey
ALTER TABLE `condicoes_pagamento` ADD CONSTRAINT `fk_condicoes_pagamento_empresa1` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
