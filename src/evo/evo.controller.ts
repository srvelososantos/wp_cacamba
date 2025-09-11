import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { EvolutionApiService } from './evo.service';

class SendMessageDto{
    instanceName: string;
    number: string;
}

@Controller('evolution-api')
export class EvoController {

    constructor(private readonly evolutionApiService: EvolutionApiService){}

    @Post('send-hello')
    async sendHelloMessage(@Body() body: SendMessageDto){
        const { instanceName, number } = body;

        if(!instanceName || !number){ throw new HttpException('Campos Instance e Number sao obrigatorios', HttpStatus.BAD_REQUEST) }    


        
        try{
            const result = await this.evolutionApiService.sendTextMessage(instanceName, number, 'api test');
            return { success: true, data: result };
        }catch(error){
            throw new HttpException('Erro ao enviar mensagem', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}
