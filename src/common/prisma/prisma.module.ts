import { Module } from '@nestjs/common';
import { PostgresService } from './prisma.service';


@Module({
  providers: [PostgresService],
  exports: [PostgresService]
})
export class PostgresModule {}
