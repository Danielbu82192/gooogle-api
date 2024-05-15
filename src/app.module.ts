import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleModule } from './api/api.module';

@Module({
  imports: [GoogleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
