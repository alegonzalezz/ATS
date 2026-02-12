// Environment-based Google Sheets Configuration
// This module reads configuration from environment variables at build time
// and provides secure defaults for deployment

import { googleSheetsClient, type GoogleSheetsConfig } from './googleSheets';

// Environment variables are available at build time in Vite
// VITE_ prefix is required for client-side env vars
const ENV_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
  clientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
  spreadsheetId: import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID,
  sheetName: import.meta.env.VITE_GOOGLE_SHEETS_SHEET_NAME || 'Sheet1',
};

/**
 * Initialize Google Sheets configuration from environment variables
 * This should be called once when the app starts
 */
export function initializeGoogleSheetsFromEnv(): void {
  const config: GoogleSheetsConfig = {};
  let hasConfig = false;

  // Only set values if they exist (not undefined or empty string)
  if (ENV_CONFIG.apiKey) {
    config.apiKey = ENV_CONFIG.apiKey;
    hasConfig = true;
  }

  if (ENV_CONFIG.spreadsheetId) {
    config.spreadsheetId = ENV_CONFIG.spreadsheetId;
    hasConfig = true;
  }

  if (ENV_CONFIG.sheetName) {
    config.sheetName = ENV_CONFIG.sheetName;
  }

  // If we have env config, apply it (overrides localStorage)
  if (hasConfig) {
    googleSheetsClient.setConfig(config);
    console.log('[Google Sheets] Configuration loaded from environment variables');
  }
}

/**
 * Check if environment-based configuration is available
 */
export function hasEnvConfiguration(): boolean {
  return !!ENV_CONFIG.spreadsheetId;
}

/**
 * Get environment configuration (for display purposes)
 */
export function getEnvConfig() {
  return {
    hasApiKey: !!ENV_CONFIG.apiKey,
    hasClientId: !!ENV_CONFIG.clientId,
    spreadsheetId: ENV_CONFIG.spreadsheetId,
    sheetName: ENV_CONFIG.sheetName,
  };
}

/**
 * Get OAuth Client ID for authentication flow
 */
export function getOAuthClientId(): string | undefined {
  return ENV_CONFIG.clientId;
}
