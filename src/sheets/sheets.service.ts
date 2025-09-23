import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";


@Injectable()
export class SheetsService {

    private readonly sheets;
    private readonly spreadsheetId = '1Ow7z4bi49gVW1M1owzzs2L3Qbcki3-fa5pkldxMRHcI'

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