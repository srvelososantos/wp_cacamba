import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvoService {
  private readonly logger = new Logger(EvoService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('EVOLUTION_API_URL');
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY');
  }

  async sendTextMessage(instanceName: string, number: string, text: string) {
    const endpoint = `${this.apiUrl}/message/sendText/${instanceName}`;

    const payload = {
      number: number,
      textMessage: {
        text: text,
      },
    };

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
    };

    try {
      this.logger.log(
        `Enviando mensagem para ${number} na instância ${instanceName}`,
      );

      // Usamos firstValueFrom para converter o Observable do HttpService em uma Promise
      const response = await firstValueFrom(
        this.httpService.post(endpoint, payload, headers),
      );

      this.logger.log('Mensagem enviada com sucesso!', response.data);
      return response.data;
    } catch (error) {
      this.logger.error(
        'Falha ao enviar mensagem',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
