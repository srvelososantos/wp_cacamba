import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from 'axios';

@Injectable()
export class WhatsapService {

    constructor(private readonly configService: ConfigService){}

    private readonly instance = 'default';
    

    async handleMessages(to: string, message: string){
        await axios.post( 
            `${this.configService.get<string>('EVOLUTIOn_API_URL')}/message/sendText/${this.instance}`,
            { number: to, text: message },
            { headers: { apikey: this.configService.get<string>('EVOLUTIOn_API_KEY') } } 
        );
    }

    async processIncomingMessage(msg: any){
        const from = msg.key.remoteJid.replace('@s.whatsapp.net', '')
        
        // Número do contato autorizado (formato internacional, sem @s.whatsapp.net)
        const allowedNumber = '551837413311';

        // Número de quem enviou a mensagem
        const number = from.replace('@s.whatsapp.net', '');

        // 🔴 Ignorar todos os números que não sejam o permitido
        if (number !== allowedNumber) {
            console.log('Mensagem ignorada de:', number);
            return;
        }

        if (from.endsWith('@g.us')) {
            console.log('Mensagem de grupo ignorada:', from);
            return;
        }

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text

        if(!text) return;

        switch (text.trim()){
            case '1':
                await this.handleMessages(from, '📄 Aqui estão as informações...');
                break;
            case '2':
                await this.handleMessages(from, '👩‍💼 Um atendente falará com você em breve.');
                break;
            case '3':
                await this.handleMessages(from, '✅ Conversa encerrada. Obrigado!');
                break;
            default:
                await this.handleMessages(from,
                'Olá! Escolha uma opção:\n1️⃣ Ver informações\n2️⃣ Falar com atendente\n3️⃣ Encerrar');
                break;
        }
    }
}