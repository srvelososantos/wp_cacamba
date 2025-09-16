import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { delay, firstValueFrom } from 'rxjs';

@Injectable()
export class EvolutionApiService {
  private readonly logger = new Logger(EvolutionApiService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('EVOLUTION_API_URL');
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY');
  }

  async sendTextMessage(instanceName: string, number: string, txt: string) {
    const endpoint = `${this.apiUrl}/message/sendText/${instanceName}`;

    const payload = {
      number: number,
      text: txt,
    };

    const options = {
      method: 'POST',
      headers: {apikey: this.apiKey, 'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    };

    console.log(JSON.stringify(payload));

    try {
      this.logger.log(
        `Enviando mensagem para ${number} na instância ${instanceName}`,
      );

      const response = await fetch(endpoint, options);
      const data = await response.json();

      this.logger.log('Mensagem enviada com sucesso!', data);
      return data;
    } catch (error) {
      this.logger.error(
        'Falha ao enviar mensagem',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
