import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UtilsModule } from 'src/utils/utils.module';
import { UsersCircuitBreakerService } from './users-circuit-breaker.service';

@Module({
  imports: [UtilsModule],
  providers: [UsersService, UsersCircuitBreakerService],
  exports: [UsersService],
})
export class UsersModule {}
