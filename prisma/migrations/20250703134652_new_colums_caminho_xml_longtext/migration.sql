/*
  Warnings:

  - Added the required column `serie` to the `nfe_evento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `nfe_evento` ADD COLUMN `digVal` VARCHAR(45) NULL,
    ADD COLUMN `serie` VARCHAR(5) NOT NULL,
    MODIFY `caminho_xml` LONGTEXT NULL;
