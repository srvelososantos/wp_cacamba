import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from 'axios';
import { SheetsService } from "src/sheets/sheets.service";

@Injectable()
export class WhatsapService {

    constructor(private readonly configService: ConfigService, private readonly sheetsService: SheetsService){}

    private readonly instance = 'Leonardo';
    private conversationState = new Map<string, { lastMessageTimestamp: number }>();
    private requestDates = new Map<string, number>();
    

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
        this.cacambaOrder(number);
        

        if(userState){
            switch (text.trim()){
                case '1':
                    await this.handleMessages(number, 'Selecione o dia que deseja solicitar a caçamba\nDias disponíveis: ')
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });

                    //cacambaOrder(number);

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
                'Olá! Escolha uma opção:\n1️⃣ Aluguél de caçamba\n2️⃣ Aluguel de máquinas\n3️⃣ Aluguel de Terra\n4️⃣ Reclamação/Denúncia\n5️⃣ Encerrar');
            // Inicia a sessão para o usuário, guardando o timestamp
            this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
        }

    }

    getToday(){
        let date = new Date(Date.now())
        let dateString = date.toISOString().split('T')[0].replace(/-/g, "/")
        return dateString;
    }

    isWeekend(day: string){
        const [diaStr, mesStr, anoStr] = day.split('/');
        // converte para número
        const dia = parseInt(diaStr, 10);
        const mes = parseInt(mesStr, 10);
        const ano = parseInt(anoStr, 10);
        const data = new Date(ano, mes - 1, dia);
        const diaSemana = data.getDay();
        if(diaSemana === 0 || diaSemana === 6){
            //console.log(diaSemana);
            return true;
        }
        return false;
    }

    async getDates() {
        let v_daysrents: string[][] = [];
        try{
            
            const res_dates = await this.sheetsService.getSheetData(`'CAÇ 2025 QTD'!A57:A175`);
            const res_requs = await this.sheetsService.getSheetData(`'CAÇ 2025 QTD'!B57:B175`);
    
            //this.requestDates.set(res_dates[0][0], (res[0][1] as number))
            //console.log('date: ', res_dates[0][0], 'qtd: ', this.requestDates.get(res[0][0]));
            
            //console.log('matriz:',res_dates[0][0]);
            const length = Math.min(res_dates.length, res_requs.length);

            for(let i = 0; i < length; i++){
                v_daysrents[i] = [];
                v_daysrents[i][0] = res_dates[i]?.[0] ?? "";
                v_daysrents[i][1] = res_requs[i]?.[0] ?? "";
                //console.log('day:', v_daysrents[i][0],  'qtd:', v_daysrents[i][1],'\n');
                if(v_daysrents[i][0] > this.getToday()){
                    console.log(v_daysrents[i][0], '>', this.getToday())
                    if(!(this.isWeekend(v_daysrents[i][0]))){
                        console.log('2')
                        console.log(parseInt(v_daysrents[i][1]), '<', 12)
                        if(parseInt(v_daysrents[i][1]) < 12){
                            console.log('3')
                        }
                    }
                }
            }
        }catch(error){
            console.log('erro:', error);
        }
    }

    async cacambaOrder(number: string){
        this.getDates();
    }
}