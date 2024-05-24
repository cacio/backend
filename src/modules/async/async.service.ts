import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';

@Injectable()
export class AsyncService {
    constructor(private prisma:PrismaService){}

}
