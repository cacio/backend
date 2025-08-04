// src/database/database.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './PrismaService'; // Certifique-se que o caminho está correto

@Global() // <-- Passo CRUCIAL: Torna o módulo global
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- Passo CRUCIAL: Exporta o serviço para outros módulos usarem
})
export class DatabaseModule {}
