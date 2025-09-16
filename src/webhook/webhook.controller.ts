import { Body, Controller, Post } from "@nestjs/common";
import { WhatsapService } from "src/whatsapp/whatsapp.service";

@Controller('webhook')
export class WebhookController{

    constructor(private readonly whatsappService: WhatsapService){}

    @Post()
    async receiveMessage(@Body() body: any){
        console.log('message:', body);
        await this.whatsappService.processIncomingMessage(body.messages[0])
        return { status: 'ok' };
    }
}