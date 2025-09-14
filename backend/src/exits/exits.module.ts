import { Module } from '@nestjs/common';
import { ExitsService } from './exits.service';
import { ExitsResolver } from './exits.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExitsService, ExitsResolver],
  exports: [ExitsService],
})
export class ExitsModule {}
