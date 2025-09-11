import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EvoModule } from './evo/evo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //test
    HttpModule, 
    UserModule, EvoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
