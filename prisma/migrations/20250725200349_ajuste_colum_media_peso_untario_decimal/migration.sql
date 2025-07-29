/*
  Warnings:

  - You are about to alter the column `mediapeso` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal(15,6)`.
  - You are about to alter the column `mediaprecounitario` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal(15,6)`.

*/
-- AlterTable
ALTER TABLE `produtos` MODIFY `mediapeso` DECIMAL(15, 6) NULL,
    MODIFY `mediaprecounitario` DECIMAL(15, 6) NULL;
