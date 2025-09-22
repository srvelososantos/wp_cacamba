import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EvolutionApiService } from './evolution-api/evolution-api.service';
import { WebhookController } from './webhook/webhook.controller';
import { WhatsapService } from './whatsapp/whatsapp.service';
import { SheetsService } from './sheets/sheets.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //test
    HttpModule,

  ],
  controllers: [AppController, WebhookController],
  providers: [AppService, EvolutionApiService, WhatsapService, SheetsService],
})
export class AppModule {}
