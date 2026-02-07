// Google Sheets API Client
// This client supports both API Key (read-only) and OAuth 2.0 (read/write) authentication

const GOOGLE_SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface GoogleSheetsConfig {
  apiKey?: string;
  spreadsheetId?: string;
  sheetName?: string;
  accessToken?: string;
}

export interface SheetsRow {
  [key: string]: string | number | boolean;
}

class GoogleSheetsClient {
  private config: GoogleSheetsConfig = {};

  setConfig(config: GoogleSheetsConfig) {
    this.config = { ...this.config, ...config };
    this.saveConfigToStorage();
  }

  getConfig(): GoogleSheetsConfig {
    return { ...this.config };
  }

  private saveConfigToStorage() {
    localStorage.setItem('google_sheets_config', JSON.stringify(this.config));
  }

  loadConfigFromStorage() {
    const stored = localStorage.getItem('google_sheets_config');
    if (stored) {
      this.config = JSON.parse(stored);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    return headers;
  }

  private getUrl(endpoint: string, params: Record<string, string> = {}): string {
    const queryParams = new URLSearchParams();
    
    if (this.config.apiKey && !this.config.accessToken) {
      queryParams.append('key', this.config.apiKey);
    }
    
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    return `${GOOGLE_SHEETS_API_URL}/${this.config.spreadsheetId}${endpoint}${queryString ? '?' + queryString : ''}`;
  }

  // READ: Get all data from a sheet
  async getAllData(sheetName?: string): Promise<SheetsRow[]> {
    const sheet = sheetName || this.config.sheetName || 'Sheet1';
    const url = this.getUrl(`/values/${encodeURIComponent(sheet)}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch data from Google Sheets');
    }

    const data = await response.json();
    return this.transformToObjects(data.values || []);
  }

  // READ: Get data with specific range
  async getRange(range: string): Promise<SheetsRow[]> {
    const url = this.getUrl(`/values/${encodeURIComponent(range)}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch range from Google Sheets');
    }

    const data = await response.json();
    return this.transformToObjects(data.values || []);
  }

  // CREATE: Append new row
  async appendRow(rowData: SheetsRow, sheetName?: string): Promise<void> {
    if (!this.config.accessToken) {
      throw new Error('OAuth access token required for writing data');
    }

    const sheet = sheetName || this.config.sheetName || 'Sheet1';
    const url = this.getUrl(`/values/${encodeURIComponent(sheet)}:append`, {
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
    });

    // First, get headers to ensure proper column alignment
    const headers = await this.getHeaders(sheet);
    const rowValues = headers.map(header => rowData[header] || '');

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to append row to Google Sheets');
    }
  }

  // CREATE: Append multiple rows
  async appendRows(rowsData: SheetsRow[], sheetName?: string): Promise<void> {
    if (!this.config.accessToken) {
      throw new Error('OAuth access token required for writing data');
    }

    const sheet = sheetName || this.config.sheetName || 'Sheet1';
    const url = this.getUrl(`/values/${encodeURIComponent(sheet)}:append`, {
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
    });

    const headers = await this.getHeaders(sheet);
    const values = rowsData.map(row => headers.map(header => row[header] || ''));

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to append rows to Google Sheets');
    }
  }

  // UPDATE: Update specific row by index
  async updateRow(rowIndex: number, rowData: SheetsRow, sheetName?: string): Promise<void> {
    if (!this.config.accessToken) {
      throw new Error('OAuth access token required for writing data');
    }

    const sheet = sheetName || this.config.sheetName || 'Sheet1';
    const headers = await this.getHeaders(sheet);
    const rowValues = headers.map(header => rowData[header] || '');

    // rowIndex is 0-based, but Sheets API uses 1-based with headers in row 1
    const range = `${sheet}!A${rowIndex + 2}:${this.columnToLetter(headers.length)}${rowIndex + 2}`;
    const url = this.getUrl(`/values/${encodeURIComponent(range)}`, {
      valueInputOption: 'USER_ENTERED',
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update row in Google Sheets');
    }
  }

  // DELETE: Clear specific row
  async deleteRow(rowIndex: number, sheetName?: string): Promise<void> {
    if (!this.config.accessToken) {
      throw new Error('OAuth access token required for deleting data');
    }

    const sheet = sheetName || this.config.sheetName || 'Sheet1';
    const headers = await this.getHeaders(sheet);
    
    // rowIndex is 0-based, but Sheets API uses 1-based with headers in row 1
    const range = `${sheet}!A${rowIndex + 2}:${this.columnToLetter(headers.length)}${rowIndex + 2}`;
    const url = this.getUrl(`/values/${encodeURIComponent(range)}:clear`);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete row from Google Sheets');
    }
  }

  // Helper: Get headers from first row
  private async getHeaders(sheetName: string): Promise<string[]> {
    const url = this.getUrl(`/values/${encodeURIComponent(sheetName)}!1:1`);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.values?.[0] || [];
  }

  // Helper: Transform array data to objects
  private transformToObjects(values: (string | number | boolean)[][]): SheetsRow[] {
    if (values.length < 2) return [];

    const headers = values[0].map(h => String(h));
    const rows = values.slice(1);

    return rows.map(row => {
      const obj: SheetsRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] ?? '';
      });
      return obj;
    });
  }

  // Helper: Convert column number to letter (1 -> A, 2 -> B, etc.)
  private columnToLetter(column: number): string {
    let temp = column;
    let letter = '';
    while (temp > 0) {
      const remainder = (temp - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      temp = Math.floor((temp - 1) / 26);
    }
    return letter;
  }

  // OAuth 2.0 Flow - Open popup for authentication
  initiateOAuth(clientId: string, redirectUri: string = window.location.origin): void {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${scope}&` +
      `include_granted_scopes=true&` +
      `state=google_sheets_auth`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      authUrl,
      'googleOAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  }

  // Handle OAuth callback
  handleOAuthCallback(hash: string): boolean {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const state = params.get('state');

    if (state === 'google_sheets_auth' && accessToken) {
      this.setConfig({ accessToken });
      return true;
    }

    return false;
  }

  // Clear authentication
  logout(): void {
    this.config.accessToken = undefined;
    this.saveConfigToStorage();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.spreadsheetId) {
        return false;
      }
      const url = this.getUrl('');
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const googleSheetsClient = new GoogleSheetsClient();
