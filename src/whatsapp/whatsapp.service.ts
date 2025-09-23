import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from 'axios';
import { SheetsService } from "src/sheets/sheets.service";

@Injectable()
export class WhatsapService {

    constructor(private readonly configService: ConfigService, private readonly sheetsService: SheetsService){}

    private readonly instance = 'Leonardo';
    private conversationState = new Map<string, { lastMessageTimestamp: number }>();
    private requestDates = new Map<string, { amountRequests: number }>();
    

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

        const number = msg.key.remoteJid.replace('@s.whatsapp.net', '')
        
        // Número do contato autorizado (formato internacional, sem @s.whatsapp.net)
        const allowedNumber = '551837413311';

        // 🔴 Ignorar todos os números que não sejam o permitido
        if (number !== allowedNumber) {
            console.log('Mensagem ignorada de:', number);
            return;
        }

        if (number.endsWith('@g.us')) {
            console.log('Mensagem de grupo ignorada:', number);
            return;
        }

        const userState = this.conversationState.get(number);
        const fiveMinutesInMs = 1 * 60 * 1000;

        // 1. Verifica se existe um estado para este usuário E se já se passaram 5 minutos
        if (userState && (Date.now() - userState.lastMessageTimestamp > fiveMinutesInMs)) {
            console.log(`Sessão expirada.`);
            this.conversationState.delete(number); // Remove o estado antigo, resetando a conversa
            return;
        }

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || 
        msg.message?.ephemeralMessage?.message.extendedTextMessage.text;

        if(!text) {
            console.log('!text')
            return;
        }

        // testan api do sheets
        try{
            const response = await this.sheetsService.getSheetData("'CAÇ 2025 QTD'!E46:E50;H30:H33");
            console.log('r: ', response);
        }catch(error){
            console.log('erro:', error);
        }
        

        if(userState){
            switch (text.trim()){
                case '1':
                    await this.handleMessages(number, '📄 Aqui estão as informações...');
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });



                    break;
                case '2':
                    await this.handleMessages(number, '👩‍💼 Um atendente falará com você em breve.');
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
                    break;
                case '3':
                    await this.handleMessages(number, '✅ Conversa encerrada. Obrigado!');
                    this.conversationState.delete(number);
                    break;
                default:
                    // Se a conversa está ativa mas a opção é inválida, podemos dar um feedback melhor
                    await this.handleMessages(number, 'Opção inválida. Por favor, escolha uma das opções do menu.');
                    // E renovamos a sessão para dar outra chance
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
                break;
            }
        }else{
            // --- LÓGICA PARA NOVA CONVERSA (ou expirada/encerrada) ---
            console.log(`Iniciando nova conversa para ${number}.`);

            await this.handleMessages(number,
                'Olá! Escolha uma opção:\n1️⃣ Ver informações\n2️⃣ Falar com atendente\n3️⃣ Encerrar');
            // Inicia a sessão para o usuário, guardando o timestamp
            this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
        }

    }
}