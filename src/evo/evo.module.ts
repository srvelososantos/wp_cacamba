import { Module } from '@nestjs/common';
import { EvoService } from './evo.service';
import { EvoController } from './evo.controller';

@Module({
  controllers: [EvoController],
  providers: [EvoService],
})
export class EvoModule {}
