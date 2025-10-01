import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvolutionApiService {
  private readonly logger = new Logger(EvolutionApiService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = "http://localhost:8080"
    this.apiKey = "76F296DCAA2B-4FEF-A5BD-7F255851927D"
  }

  async sendTextMessage(instanceName: string, number: string, text: string) {
    const endpoint = `${this.apiUrl}/message/sendText/${instanceName}`;

    const payload = {
      number: number,
      text: text,
    };

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
    };

    try {
      this.logger.log(
        `Enviando mensagem para ${number}, ${this.configService.get<string>('EVOLUTIOn_API_URL')} na instância ${instanceName}`,
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
