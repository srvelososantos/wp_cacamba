import { Body, Controller, Post } from "@nestjs/common";
import { WhatsapService } from "src/whatsapp/whatsapp.service";

@Controller('webhook')
export class WebhookController{

    constructor(private readonly whatsappService: WhatsapService){}

    @Post()
    async receiveMessage(@Body() body: any){
        //console.log('Webhook recebido:', JSON.stringify(body.data.message, null, 2));

        const messageData = body.data
        // para evitar mensagens duplicadas 

        if(messageData){ this.whatsappService.processIncomingMessage(messageData).catch(error => {
            // É crucial registrar quaisquer erros de processamento aqui
            console.error('Erro no processamento da mensagem em background:', error);
        }); }
        
        return { status: 'ok' };
    }
}