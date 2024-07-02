import { IsOptional, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateProdutoDto {
    @IsUUID()
    @IsOptional()
    codigo?: string;

    @IsOptional()
    @IsString()
    cprod?: string;

    @IsOptional()
    @IsString()
    cean?: string;

    @IsOptional()
    @IsString()
    xprod?: string;

    @IsOptional()
    @IsNumber()
    ncm?: number;

    @IsOptional()
    @IsString()
    cfop_expecif?: string;

    @IsOptional()
    @IsString()
    ceantrib?: string;

    @IsOptional()
    @IsString()
    unMedida?: string;

    @IsOptional()
    @IsDateString()
    dtContagemEstoque?: Date;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    qtdContagemKg?: number;

    @IsOptional()
    @IsNumber()
    qtdContagemPc?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    pesoLiquido?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    pesoBruto?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    aliquotaICMS?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percRedBcICMS?: number;

    @IsOptional()
    @IsNumber()
    AliquotaICMSST_MVA?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percRedBcICMSST?: number;

    @IsOptional()
    @IsString()
    CSTICMS?: string;

    @IsOptional()
    @IsNumber()
    CSTIPI?: number;

    @IsOptional()
    @IsNumber()
    CSTPISCOFINS_E?: number;

    @IsOptional()
    @IsNumber()
    CSTPISCOFINS_S?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percBcPisCofins?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    AliquotaPisCofins_E?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    AliquotaPisCofins_S?: number;

    @IsOptional()
    @IsString()
    xInfAdProd?: string;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percBcIpi?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    AliquotaIpi?: number;

    @IsNumber({maxDecimalPlaces: 2})
    valor_unitario: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    fatorbcicmsret?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    fatorvlricmsret?: number;

    @IsOptional()
    @IsString()
    CENQ?: string;

    @IsOptional()
    @IsString()
    CBENEF?: string;

    @IsOptional()
    @IsString()
    idemp?: string;

    @IsOptional()
    created_at?: Date;

    @IsOptional()
    updated_at?: Date;
}

export class UpdateProdutoDto {

    @IsOptional()
    @IsString()
    cprod?: string;

    @IsOptional()
    @IsString()
    cean?: string;

    @IsOptional()
    @IsString()
    xprod?: string;

    @IsOptional()
    @IsNumber()
    ncm?: number;

    @IsOptional()
    @IsString()
    cfop_expecif?: string;

    @IsOptional()
    @IsString()
    ceantrib?: string;

    @IsOptional()
    @IsString()
    unMedida?: string;

    @IsOptional()
    @IsDateString()
    dtContagemEstoque?: Date;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    qtdContagemKg?: number;

    @IsOptional()
    @IsNumber()
    qtdContagemPc?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    pesoLiquido?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    pesoBruto?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    aliquotaICMS?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percRedBcICMS?: number;

    @IsOptional()
    @IsNumber()
    AliquotaICMSST_MVA?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percRedBcICMSST?: number;

    @IsOptional()
    @IsString()
    CSTICMS?: string;

    @IsOptional()
    @IsNumber()
    CSTIPI?: number;

    @IsOptional()
    @IsNumber()
    CSTPISCOFINS_E?: number;

    @IsOptional()
    @IsNumber()
    CSTPISCOFINS_S?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percBcPisCofins?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    AliquotaPisCofins_E?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    AliquotaPisCofins_S?: number;

    @IsOptional()
    @IsString()
    xInfAdProd?: string;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    percBcIpi?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    AliquotaIpi?: number;

    @IsNumber({maxDecimalPlaces: 2})
    valor_unitario: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    fatorbcicmsret?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    fatorvlricmsret?: number;

    @IsOptional()
    @IsString()
    CENQ?: string;

    @IsOptional()
    @IsString()
    CBENEF?: string;

    @IsOptional()
    updated_at?: Date;
}