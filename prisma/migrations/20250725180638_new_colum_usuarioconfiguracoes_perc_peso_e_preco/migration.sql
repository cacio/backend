/*
  Warnings:

  - You are about to alter the column `mediapeso` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `mediaprecounitario` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.

*/
-- AlterTable
ALTER TABLE `produtos` MODIFY `mediapeso` DECIMAL NULL,
    MODIFY `mediaprecounitario` DECIMAL NULL;

-- AlterTable
ALTER TABLE `usuario_configuracao` ADD COLUMN `percpesoproduto` FLOAT NULL,
    ADD COLUMN `percprecoproduto` FLOAT NULL;
