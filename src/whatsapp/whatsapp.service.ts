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
        // if(days){
        //     await axios.post( 
        //         `${this.configService.get<string>('EVOLUTIOn_API_URL')}/message/sendText/${this.instance}`,
        //         { number: to, text: message },
        //         { headers: { apikey: this.configService.get<string>('EVOLUTIOn_API_KEY') } } 
        //     );
        // }
    }

    async handleMessagesButtons(to: string, message: string){
        try{
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
        //this.cacambaOrder(number);
        

        if(userState){
            switch (text.trim()){
                case '1':
                    await this.handleMessages(number, 
                        'Envie o número de acordo com o dia que deseja solicitar a caçamba.\nEnvie o nome completo, CPF e endereço de entrega.\nAguarde que enviaremos o boleto da caçamba em breve.\nDias disponíveis: ')
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
                    this.cacambaOrder(number);
                    
                    break;
                case '2':
                    await this.handleMessages(number, 'Infelizmente no momento não estamos fornecendo este tipo de serviço.');
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
                    
                    break;
                case '3':
                    await this.handleMessages(number, 'Infelizmente no momento não estamos fornecendo este tipo de serviço.');
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
                    
                    break;
                case '4':
                    await this.handleMessages(number, 'Descreva em poucas palavras sua reclamaçao/denúncia, não esqueça de mencionar o endereço da ocorrência.\nSe possível envie fotos e vídeos do ocorrido.\nUm atendente dará prosseguimento a esta reclamação/denúncia, aguarde.');
                    this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
                    
                    break;
                case '5':
                    await this.handleMessages(number, 'Atendimento encerrado.');
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
                'Olá, Secretaria de Obras de Castilho, em que podemos ajudar?\n\nEscolha uma opção:\n1️⃣  Aluguél de caçamba\n2️⃣  Aluguel de máquinas\n3️⃣  Aluguel de Terra\n4️⃣  Reclamação/Denúncia\n5️⃣  Encerrar');
            // Inicia a sessão para o usuário, guardando o timestamp
            this.conversationState.set(number, { lastMessageTimestamp: Date.now() });
        }

    }

    blackListDays(dateString: string){
       if(  dateString === '02/10/2025' ||
            dateString === '03/10/2025' ||
            dateString === '27/10/2025'
       ){
            return false;
       }
       return true;
    }

    parseDateBR(dateString: string): Date {
        const parts = dateString.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        const monthIndex = month - 1;
        return new Date(year, monthIndex, day);
    }

    tobrFormat(day: string){
        let newdateaux = day.split("/");
        const newdate = newdateaux[2] + '/' + newdateaux[1] + '/' + newdateaux[0]
        return newdate;
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
        let v_days: string[] = [];
        let j = 0;

        try{
            const res_dates = await this.sheetsService.getSheetData(`'CAÇ 2025 QTD'!A57:A175`);
            const res_requs = await this.sheetsService.getSheetData(`'CAÇ 2025 QTD'!B57:B175`);
    
            const length = Math.min(res_dates.length, res_requs.length);

            for(let i = 0; i < length; i++){
                v_daysrents[i] = [];
                v_daysrents[i][0] = res_dates[i]?.[0] ?? "";
                v_daysrents[i][1] = res_requs[i]?.[0] ?? "";

                if(this.parseDateBR(v_daysrents[i][0]) > this.parseDateBR(this.tobrFormat(this.getToday()))){
                    if(!(this.isWeekend(v_daysrents[i][0]))){
                        if(parseInt(v_daysrents[i][1]) < 12){
                            if(this.blackListDays(v_daysrents[i][0])){ //        IF DE AJUSTE MANUAL DE DIAS EXEMPLO: FERIADOS
                                if(j < 15){
                                    //console.log('day:', v_daysrents[i][0],  'qtd:', v_daysrents[i][1],'\n');
                                    v_days[j] = v_daysrents[i][0];
                                    j++;
                                }
                            }
                        }
                    }
                }
            }
        }catch(error){
            console.log('erro:', error);
        }
        return v_days;
    }

    async cacambaOrder(number: string){
        let available_days: string[];

        available_days = await this.getDates()
        for(let i = 0; i < available_days.length; i++){
            available_days[i] = `${i+1} - ${available_days[i]}`;
        }

        await this.handleMessages(number, available_days.join("\n"));
    }
}