import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { UsersCircuitBreakerService } from './users-circuit-breaker.service';
import { UsersService } from './users.service';

@Module({
  imports: [UtilsModule],
  providers: [UsersCircuitBreakerService, UsersService],
  exports: [UsersCircuitBreakerService, UsersService],
})
export class UsersModule {}
