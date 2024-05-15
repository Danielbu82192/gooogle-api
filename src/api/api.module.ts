import { Module } from '@nestjs/common';
import { GoogleService } from './api.service';
import { GoogleController } from './api.controller';

@Module({  
    controllers: [GoogleController],
    providers: [GoogleService]
})
export class GoogleModule {}
