-- CreateTable
CREATE TABLE `permissoes` (
    `idpermissoes` INTEGER NOT NULL AUTO_INCREMENT,
    `idmenu` INTEGER NULL,
    `idsubmenu` INTEGER NULL,
    `idusuario` INTEGER NULL,

    PRIMARY KEY (`idpermissoes`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submenu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(45) NULL,
    `idmenu` INTEGER NULL,
    `idusuario` INTEGER NULL,
    `link` VARCHAR(45) NULL,
    `icone` VARCHAR(45) NULL,
    `sort` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NULL,
    `email` VARCHAR(100) NULL,
    `login` VARCHAR(45) NULL,
    `passwd` VARCHAR(150) NULL,
    `photo` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(6) NULL,
    `updated_at` TIMESTAMP(6) NULL,
    `codrepre` CHAR(10) NULL,
    `user_ativo` ENUM('S', 'N') NULL DEFAULT 'N',
    `idemp` INTEGER NOT NULL,

    INDEX `fk_usuario_empresa1_idx`(`idemp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `banco` VARCHAR(3) NULL,
    `carteira` VARCHAR(2) NULL,
    `agencia` VARCHAR(45) NULL,
    `conta` VARCHAR(45) NULL,
    `contadv` VARCHAR(45) NULL,
    `agenciadv` VARCHAR(45) NULL,
    `codigocliente` VARCHAR(45) NULL,
    `nome` VARCHAR(60) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bancos_atv` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(4) NULL,
    `nome` VARCHAR(45) NULL,
    `ativo` ENUM('S', 'N') NULL,
    `apelido` VARCHAR(90) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `benificiario_emitente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NULL,
    `endereco` VARCHAR(45) NULL,
    `cep` VARCHAR(45) NULL,
    `complemento` VARCHAR(45) NULL,
    `numero` VARCHAR(45) NULL,
    `uf` VARCHAR(45) NULL,
    `cidade` VARCHAR(45) NULL,
    `documento` VARCHAR(45) NULL,
    `id_banco` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boletos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sacado` VARCHAR(300) NULL,
    `sacado_endereco` VARCHAR(150) NULL,
    `sacado_numero` VARCHAR(45) NULL,
    `sacado_cep` VARCHAR(45) NULL,
    `sacado_cnpj` VARCHAR(20) NULL,
    `sacado_uf` VARCHAR(2) NULL,
    `sacado_cidade` VARCHAR(60) NULL,
    `instrucoes` TEXT NULL,
    `agencia` VARCHAR(45) NULL,
    `agencia_dv` VARCHAR(45) NULL,
    `conta` VARCHAR(45) NULL,
    `conta_dv` VARCHAR(45) NULL,
    `carteira` VARCHAR(45) NULL,
    `identificacao` VARCHAR(45) NULL,
    `cedente` VARCHAR(250) NULL,
    `cedente_cpf_cnpj` VARCHAR(45) NULL,
    `cedente_endereco` VARCHAR(60) NULL,
    `cedente_cidade` VARCHAR(60) NULL,
    `cedente_uf` VARCHAR(2) NULL,
    `quantidade` VARCHAR(45) NULL,
    `valor_unitario` FLOAT NULL,
    `aceite` VARCHAR(45) NULL,
    `especie` VARCHAR(45) NULL,
    `especie_doc` VARCHAR(45) NULL,
    `nosso_numero` VARCHAR(45) NULL,
    `numero_documento` VARCHAR(60) NULL,
    `data_vencimento` DATE NULL,
    `data_documento` DATE NULL,
    `data_processamento` DATE NULL,
    `valor_boleto` FLOAT NULL,
    `codigo_barras` VARCHAR(60) NULL,
    `linha_digitavel` VARCHAR(200) NULL,
    `agencia_codigo` VARCHAR(60) NULL,
    `codigo_banco_com_dv` VARCHAR(45) NULL,
    `codigo_nfe` INTEGER NULL,
    `numero_duplicata` VARCHAR(45) NULL,
    `impresso_s_n` ENUM('S', 'N') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cfop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Codigo` INTEGER NOT NULL,
    `Nome` TEXT NULL,
    `dados_ad_fisc` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cfop_natura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Codigo` INTEGER NOT NULL,
    `cod_especif` VARCHAR(45) NULL,
    `Nome` TEXT NULL,
    `dados_ad_fisc` TEXT NULL,
    `dados_ad_cliente` TEXT NULL,
    `CSTICMS` INTEGER NULL,
    `CSTIPI` INTEGER NULL,
    `CSTPISCOFINS` INTEGER NULL,
    `aliquotaICMS` FLOAT NULL,
    `percRedBcICMS` FLOAT NULL,
    `AliquotaICMSST_MVA` FLOAT NULL,
    `percRedBcICMSST` FLOAT NULL,
    `percBcPis` FLOAT NULL,
    `percBcCofins` FLOAT NULL,
    `AliquotaPis` FLOAT NULL,
    `AliquotaCofins` FLOAT NULL,
    `percBcIpi` FLOAT NULL,
    `AliquotaIpi` FLOAT NULL,
    `calculasn` ENUM('S', 'N') NULL,
    `CBENEF` VARCHAR(60) NULL,
    `idemp` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NULL,
    `estado` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `duplic_receber` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ndup` VARCHAR(45) NULL,
    `vlrdup` FLOAT NULL,
    `vencdup` DATE NULL,
    `cod_forc` VARCHAR(5) NULL,
    `idemp` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emitente` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpj` VARCHAR(14) NULL,
    `cpf` VARCHAR(11) NULL,
    `xnome` VARCHAR(60) NULL,
    `xfant` VARCHAR(60) NULL,
    `enderemit` TEXT NULL,
    `xlgr` VARCHAR(60) NULL,
    `nro` VARCHAR(60) NULL,
    `xcpl` VARCHAR(60) NULL,
    `xbairro` VARCHAR(60) NULL,
    `cmun` INTEGER NULL,
    `xmun` VARCHAR(60) NULL,
    `uf` VARCHAR(2) NULL,
    `cep` CHAR(8) NULL,
    `cpais` CHAR(4) NULL,
    `xpais` VARCHAR(60) NULL,
    `fone` CHAR(14) NULL,
    `ie` VARCHAR(14) NULL,
    `iest` VARCHAR(14) NULL,
    `im` VARCHAR(15) NULL,
    `cnae` VARCHAR(7) NULL,
    `crt` INTEGER NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NULL,
    `cnpj` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(75) NULL,
    `uf` VARCHAR(5) NULL,
    `pais` INTEGER NULL,
    `codigo` VARCHAR(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedor` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `cod_retaquarda` VARCHAR(5) NULL,
    `cnpj` VARCHAR(14) NULL,
    `cpf` VARCHAR(11) NULL,
    `xnome` VARCHAR(60) NULL,
    `xfantasia` VARCHAR(60) NULL,
    `enderdest` VARCHAR(60) NULL,
    `xlgr` VARCHAR(60) NULL,
    `nro` VARCHAR(60) NULL,
    `xcpl` VARCHAR(60) NULL,
    `xbairro` VARCHAR(60) NULL,
    `cmun` VARCHAR(7) NULL,
    `xmun` VARCHAR(60) NULL,
    `uf` CHAR(2) NULL,
    `cep` VARCHAR(8) NULL,
    `cpais` VARCHAR(4) NULL,
    `xpais` VARCHAR(60) NULL,
    `fone` VARCHAR(14) NULL,
    `ie` VARCHAR(14) NULL,
    `isuf` VARCHAR(9) NULL,
    `email` VARCHAR(60) NULL,
    `status` VARCHAR(45) NULL DEFAULT '0',
    `id_representate` VARCHAR(10) NULL,
    `forma_pag` VARCHAR(6) NULL,
    `prazo1` INTEGER NULL,
    `prazo2` INTEGER NULL,
    `prazo3` INTEGER NULL,
    `prazo4` INTEGER NULL,
    `prazo5` INTEGER NULL,
    `idemp` INTEGER NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ncm` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `ncm` INTEGER NULL,
    `descricao` TEXT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nfe` (
    `nfe_codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `nfe_numeracao` INTEGER NULL,
    `fornecedor_codigo` INTEGER NOT NULL,
    `nfe_dtemis` DATETIME(0) NULL,
    `nfe_dtentrega` DATE NULL,
    `nfe_total_nota` FLOAT NULL,
    `nfe_total_produtos` FLOAT NULL,
    `nfe_natureza_operacao` INTEGER NULL,
    `nfe_totvbcicms` FLOAT NULL,
    `nfe_totvicms` FLOAT NULL,
    `nfe_totvbcicmsst` FLOAT NULL,
    `nfe_totvicmsst` FLOAT NULL,
    `nfe_totvbcipi` FLOAT NULL,
    `nfe_totvipi` FLOAT NULL,
    `nfe_totvbcpis` FLOAT NULL,
    `nfe_totvpis` FLOAT NULL,
    `nfe_totvbccofins` FLOAT NULL,
    `nfe_totvcofins` FLOAT NULL,
    `nfe_vtotfrete` FLOAT NULL,
    `nfe_vtotseguro` FLOAT NULL,
    `nfe_vtotdesconto` FLOAT NULL,
    `nfe_voutros` FLOAT NULL,
    `nfe_formpag` INTEGER NULL,
    `nfe_manifesto` VARCHAR(10) NULL,
    `nfe_fatumento` ENUM('S', 'N') NULL,
    `idemp` INTEGER NULL,

    UNIQUE INDEX `nfe_nfe_codigo_key`(`nfe_codigo`),
    PRIMARY KEY (`nfe_codigo`, `fornecedor_codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nfe_evento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chave_acesso` VARCHAR(44) NULL,
    `cstat` VARCHAR(45) NULL,
    `protocolo` VARCHAR(45) NULL,
    `caminho_xml` VARCHAR(500) NULL,
    `data_evento` DATETIME(0) NULL,
    `xmotivo` VARCHAR(500) NULL,
    `id_nfe` INTEGER NOT NULL,

    INDEX `fk_nfe_evento_nfe_idx`(`id_nfe`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nfe_produtos` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `nfe_codigo` INTEGER NOT NULL,
    `produtos_codigo` INTEGER NULL,
    `nfe_subtotal` FLOAT NULL,
    `nfe_vbcicms` FLOAT NULL,
    `nfe_vicms` FLOAT NULL,
    `nfe_vbcicmsst` FLOAT NULL,
    `nfe_vicmsst` FLOAT NULL,
    `nfe_vbcipi` FLOAT NULL,
    `nfe_vipi` FLOAT NULL,
    `nfe_vbcpis` FLOAT NULL,
    `nfe_vpis` FLOAT NULL,
    `nfe_vbccofins` FLOAT NULL,
    `nfe_vcofins` FLOAT NULL,
    `nfe_vdesconto` FLOAT NULL,
    `nfe_pecas` FLOAT NULL,
    `nfe_quantidade` FLOAT NULL,
    `nfe_valorunitario` FLOAT NULL,
    `nfe_infadprod` TEXT NULL,
    `nfe_cfop` VARCHAR(60) NULL,

    INDEX `fk_nfe_produtos_nfe1_idx`(`nfe_codigo`),
    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nosso_numero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tablet` VARCHAR(3) NULL,
    `nosso_numero_ini` VARCHAR(6) NULL,
    `nosso_numero_fim` VARCHAR(6) NULL,
    `ultimo_numero` VARCHAR(6) NULL,
    `id_banco` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NULL,
    `sigla` VARCHAR(10) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preco_produto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `preco_venda` FLOAT NULL,
    `perc_var_min` FLOAT NULL,
    `perc_var_max` FLOAT NULL,
    `perc_valor` FLOAT NULL,
    `id_produto` VARCHAR(60) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `cprod` VARCHAR(60) NULL,
    `cean` VARCHAR(14) NULL,
    `xprod` VARCHAR(120) NULL,
    `ncm` INTEGER NULL,
    `cfop_expecif` CHAR(60) NULL,
    `ceantrib` VARCHAR(14) NULL,
    `unMedida` VARCHAR(3) NULL,
    `dtContagemEstoque` DATE NULL,
    `qtdContagemKg` FLOAT NULL,
    `qtdContagemPc` INTEGER NULL,
    `pesoLiquido` FLOAT NULL,
    `pesoBruto` FLOAT NULL,
    `aliquotaICMS` FLOAT NULL,
    `percRedBcICMS` FLOAT NULL,
    `AliquotaICMSST_MVA` INTEGER NULL,
    `percRedBcICMSST` FLOAT NULL,
    `CSTICMS` VARCHAR(3) NULL,
    `CSTIPI` INTEGER NULL,
    `CSTPISCOFINS_E` INTEGER NULL,
    `CSTPISCOFINS_S` INTEGER NULL,
    `percBcPisCofins` FLOAT NULL,
    `AliquotaPisCofins_E` FLOAT NULL,
    `AliquotaPisCofins_S` FLOAT NULL,
    `xInfAdProd` VARCHAR(60) NULL,
    `percBcIpi` FLOAT NULL,
    `AliquotaIpi` FLOAT NULL,
    `valor_unitario` FLOAT NOT NULL,
    `fatorbcicmsret` FLOAT NULL,
    `fatorvlricmsret` FLOAT NULL,
    `CENQ` VARCHAR(45) NULL,
    `CBENEF` VARCHAR(60) NULL,
    `idemp` INTEGER NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sequencia_boleto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sequencia` VARCHAR(4) NULL,
    `ano` YEAR NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `st_trib_icms` (
    `CODIGO` VARCHAR(2) NOT NULL,
    `DESCRICAO` TEXT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `st_trib_ipi` (
    `CODIGO` VARCHAR(2) NOT NULL,
    `DESCRICAO` TEXT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `st_trib_pis_cofins` (
    `CODIGO` VARCHAR(2) NOT NULL,
    `DESCRICAO` TEXT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tab_duplicata` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_nota` VARCHAR(45) NULL,
    `numero_duplicata` VARCHAR(45) NULL,
    `data_emissao` DATE NULL,
    `data_vencimento` DATE NULL,
    `valor_duplicata` FLOAT NULL,
    `valor_nota` FLOAT NULL,
    `forma_pagto` VARCHAR(45) NULL,
    `nosso_numero` VARCHAR(11) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tabelacest` (
    `codigo_tbc` INTEGER NOT NULL AUTO_INCREMENT,
    `legal_tbc` INTEGER NOT NULL,
    `ncm_tbc` INTEGER NOT NULL,
    `descricao_tbc` VARCHAR(300) NOT NULL,

    INDEX `ncm_tbc`(`ncm_tbc`),
    PRIMARY KEY (`codigo_tbc`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tabmun` (
    `CODIGO` INTEGER NOT NULL AUTO_INCREMENT,
    `DESCRICAO` VARCHAR(150) NULL,
    `MUNICIPIO` VARCHAR(7) NULL,

    PRIMARY KEY (`CODIGO`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_manifestos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATE NULL,
    `n_manifesto` VARCHAR(10) NULL,
    `n_item` INTEGER NULL,
    `cod_produto` VARCHAR(60) NULL,
    `qtd_prod` VARCHAR(45) NULL,
    `vlr_unit` DECIMAL(10, 2) NULL,
    `vBCSTRet` FLOAT NULL,
    `vICMSSTRet` FLOAT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unidade_medida` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `veiculos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placa` VARCHAR(45) NULL,
    `uf` VARCHAR(2) NULL,
    `rntc` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `fk_usuario_empresa1` FOREIGN KEY (`idemp`) REFERENCES `empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe_evento` ADD CONSTRAINT `fk_nfe_evento_nfe` FOREIGN KEY (`id_nfe`) REFERENCES `nfe`(`nfe_codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nfe_produtos` ADD CONSTRAINT `fk_nfe_produtos_nfe1` FOREIGN KEY (`nfe_codigo`) REFERENCES `nfe`(`nfe_codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;
