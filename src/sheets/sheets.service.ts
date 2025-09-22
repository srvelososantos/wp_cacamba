import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";


@Injectable()
export class SheetsService {

    private readonly sheets;
    private readonly spreadsheetId = 'https://docs.google.com/spreadsheets/d/1O0Pm3iqUk2_wKqz4pklVMoUtxQ6QlHV3/edit?usp=sharing&ouid=112023639168578092464&rtpof=true&sd=true'

    constructor(private configService: ConfigService){
        const auth = new google.auth.GoogleAuth({
            keyFile: 'src/config/whatsappcacamba-1ab377983f84.json', // Caminho para seu arquivo JSON
            scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Escopo para ler e escrever
        });
        this.sheets = google.sheets({ version: 'v4', auth });
    }

        // Função para LER dados
    async getSheetData(range: string): Promise<any[][] | null | undefined> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: range, // Ex: 'Página1!A1:B10'
            });
            return response.data.values;
        } catch (err) {
            console.error('A API do Google Sheets retornou um erro: ' + err);
            return null;
        }
    }

}