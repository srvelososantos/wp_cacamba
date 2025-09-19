import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from 'axios';

@Injectable()
export class WhatsapService {

    constructor(private readonly configService: ConfigService){}

    private readonly instance = 'Leonardo';
    private conversationState = new Map<string, { lastMessageTimestamp: number }>();
    

    async handleMessages(to: string, message: string){
        try{
            console.log('-----------------------------------------------')
            await axios.post( 
                `${this.configService.get<string>('EVOLUTIOn_API_URL')}/message/sendText/${this.instance}`,
                { number: to, text: message },
                { headers: { apikey: this.configService.get<string>('EVOLUTIOn_API_KEY') } } 
            );
        }catch(HttpException){
            console.log('erro:', HttpException)
        }
    }

    async processIncomingMessage(msg: any){

        if (msg.key.fromMe) {
            return;
        }

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

        const userState = this.conversationState.get(from);
        const fiveMinutesInMs = 1 * 60 * 1000;

        // 1. Verifica se existe um estado para este usuário E se já se passaram 5 minutos
        if (userState && (Date.now() - userState.lastMessageTimestamp > fiveMinutesInMs)) {
            console.log(`Sessão expirada.`);
            this.conversationState.delete(from); // Remove o estado antigo, resetando a conversa
            return;
        }

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || 
        msg.message?.ephemeralMessage?.message.extendedTextMessage.text;

        if(!text) {
            console.log('!text')
            return;
        }

        if(userState){
            switch (text.trim()){
                case '1':
                    await this.handleMessages(from, '📄 Aqui estão as informações...');
                    this.conversationState.set(from, { lastMessageTimestamp: Date.now() });
                    break;
                case '2':
                    await this.handleMessages(from, '👩‍💼 Um atendente falará com você em breve.');
                    this.conversationState.set(from, { lastMessageTimestamp: Date.now() });
                    break;
                case '3':
                    await this.handleMessages(from, '✅ Conversa encerrada. Obrigado!');
                    this.conversationState.delete(from);
                    break;
                default:
                    // Se a conversa está ativa mas a opção é inválida, podemos dar um feedback melhor
                    await this.handleMessages(from, 'Opção inválida. Por favor, escolha uma das opções do menu.');
                    // E renovamos a sessão para dar outra chance
                    this.conversationState.set(from, { lastMessageTimestamp: Date.now() });
                break;
            }
        }else{
            // --- LÓGICA PARA NOVA CONVERSA (ou expirada/encerrada) ---
            console.log(`Iniciando nova conversa para ${from}.`);

            await this.handleMessages(from,
                'Olá! Escolha uma opção:\n1️⃣ Ver informações\n2️⃣ Falar com atendente\n3️⃣ Encerrar');
            // Inicia a sessão para o usuário, guardando o timestamp
            this.conversationState.set(from, { lastMessageTimestamp: Date.now() });
        }

    }
}