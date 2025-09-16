import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EvolutionApiService } from './evolution-api/evolution-api.service';

class SendMessageDto{
    instanceName: string;
    number: string;
}

@Controller('evo')
export class AppController {
  constructor(private readonly evolutionApiService: EvolutionApiService){}
  
    @Post('send-hello')
    async sendHelloMessage(@Body() body: SendMessageDto){
        const { instanceName, number } = body;

        if(!instanceName || !number){ throw new HttpException('Campos Instance e Number sao obrigatorios', HttpStatus.BAD_REQUEST) }    

        try{
            const result = await this.evolutionApiService.sendTextMessage(instanceName, number, 'oi gatinha <3');
            return { success: true, data: result };
        }catch(error){
            throw new HttpException('Erro ao enviar mensagem', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
  
}
