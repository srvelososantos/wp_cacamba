import { Body, Controller, Post } from "@nestjs/common";
import { WhatsapService } from "src/whatsapp/whatsapp.service";

@Controller('webhook')
export class WebhookController{

    constructor(private readonly whatsappService: WhatsapService){}

    @Post()
    async receiveMessage(@Body() body: any){
        console.log('Webhook recebido:', JSON.stringify(body, null, 2));

        const messageData = body.data

        if(messageData){ await this.whatsappService.processIncomingMessage(messageData) }
        
        return { status: 'ok' };
    }
}