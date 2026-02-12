# Configuración Segura de Google Sheets

Esta guía te ayudará a configurar Google Sheets con variables de entorno y desplegar de forma segura usando GitHub Secrets.

## Resumen de Seguridad

- **Variables de entorno**: Las credenciales se configuran como `VITE_` prefixed env vars
- **GitHub Secrets**: Las credenciales se almacenan de forma segura en GitHub y se inyectan en el build
- **Protección automática**: Los campos configurados vía env vars se muestran como bloqueados en la UI
- **Sin exposición**: Las credenciales nunca se exponen en el código fuente

## Paso 1: Configurar Variables de Entorno Locales

Para desarrollo local, crea un archivo `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# REQUIRED
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
VITE_GOOGLE_SHEETS_SHEET_NAME=Sheet1

# OPTIONAL - Para acceso de solo lectura
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI

# OPTIONAL - Para operaciones de escritura (CRUD completo)
VITE_GOOGLE_OAUTH_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

**IMPORTANTE**: El archivo `.env` está en `.gitignore` y nunca debe commitearse.

## Paso 2: Configurar GitHub Secrets

Para producción, configura los secrets en GitHub:

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** > **Secrets and variables** > **Actions**
3. Haz clic en **New repository secret**
4. Agrega cada variable:

### Secrets Requeridos:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `VITE_GOOGLE_SHEETS_SPREADSHEET_ID` | ID de tu spreadsheet | ✅ Sí |
| `VITE_GOOGLE_SHEETS_SHEET_NAME` | Nombre de la hoja (ej: Sheet1) | ✅ Sí |

### Secrets Opcionales:

| Secret Name | Value | Cuándo usar |
|-------------|-------|-------------|
| `VITE_GOOGLE_SHEETS_API_KEY` | API Key de Google Cloud | Solo lectura de hojas públicas |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | Client ID de OAuth 2.0 | Escritura (CRUD completo) |

### Captura de pantalla de configuración:

```
GitHub Repository
├── Settings
│   └── Secrets and variables
│       └── Actions
│           ├── New repository secret
│           │   ├── Name: VITE_GOOGLE_SHEETS_SPREADSHEET_ID
│           │   └── Secret: [tu-spreadsheet-id]
│           ├── New repository secret
│           │   ├── Name: VITE_GOOGLE_SHEETS_SHEET_NAME
│           │   └── Secret: Sheet1
│           └── New repository secret
│               ├── Name: VITE_GOOGLE_OAUTH_CLIENT_ID
│               └── Secret: [tu-client-id]
```

## Paso 3: Cómo Funciona

### Flujo de Build:

1. **Desarrollo local**: Vite carga variables de `.env`
2. **GitHub Actions**: El workflow inyecta secrets como variables de entorno
3. **Build time**: Vite embebe las variables en el bundle
4. **Deploy**: La app se despliega con configuración pre-inyectada

### En la UI:

Cuando una configuración viene de env vars:
- Se muestra un banner azul "Configuración segura activa"
- Los campos protegidos muestran badge "ENV"
- Los campos protegidos están deshabilitados para edición
- El usuario solo necesita autenticarse con OAuth (si está configurado)

## Paso 4: Obtener Credenciales de Google Cloud

### 1. Crear Proyecto en Google Cloud:

```
https://console.cloud.google.com/
```

1. Crear nuevo proyecto
2. Habilitar **Google Sheets API**
3. Configurar pantalla de consentimiento OAuth (si usas OAuth)

### 2. Obtener Spreadsheet ID:

```
URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                                    └──────────────────────┘
                                                    ^ Este es el ID
```

### 3. Obtener API Key (solo lectura):

```
Google Cloud Console
├── APIs & Services
│   └── Credentials
│       └── Create credentials
│           └── API key
```

### 4. Obtener OAuth Client ID (escritura):

```
Google Cloud Console
├── APIs & Services
│   └── Credentials
│       └── Create credentials
│           └── OAuth client ID
│               └── Application type: Web application
│               └── Authorized JavaScript origins:
│                   └── https://tu-usuario.github.io
│               └── Authorized redirect URIs:
│                   └── https://tu-usuario.github.io/ATS/oauth-callback.html
```

## Paso 5: Configurar Dominios Autorizados

Para OAuth, debes agregar tu dominio de GitHub Pages:

```
https://[tu-usuario].github.io/ATS/
```

En Google Cloud Console:
1. Ve a **Credentials** > tu OAuth Client ID
2. Agrega en **Authorized JavaScript origins**:
   - `https://[tu-usuario].github.io`
3. Agrega en **Authorized redirect URIs**:
   - `https://[tu-usuario].github.io/ATS/oauth-callback.html`

## Paso 6: Verificar el Deploy

1. Haz push a la rama main
2. GitHub Actions ejecutará el workflow automáticamente
3. Verifica en la pestaña **Actions** que el build sea exitoso
4. Visita tu app desplegada
5. Ve a la sección "Google Sheets"
6. Deberías ver el banner "Configuración segura activa"

## Estructura de Archivos

```
├── .env.example                          # Template de variables
├── .env                                  # Variables locales (no commitear)
├── .github/workflows/deploy.yml          # Workflow con secrets
├── src/
│   ├── lib/
│   │   ├── googleSheets.ts              # Cliente de la API
│   │   └── googleSheetsEnv.ts           # Configuración de env vars
│   ├── hooks/
│   │   └── useGoogleSheets.ts           # Hook con auto-inicialización
│   └── components/
│       ├── GoogleSheetsSettings.tsx     # UI con protección de env vars
│       └── GoogleSheetsDemo.tsx         # Demo funcional
└── public/
    └── oauth-callback.html              # Callback de OAuth
```

## Troubleshooting

### "Configuración segura activa" no aparece:

- Verifica que los secrets estén configurados en GitHub
- Revisa el workflow en Actions > Deploy Vite App
- Asegúrate de que los nombres de los secrets coincidan exactamente

### Error de CORS en producción:

- Agrega tu dominio de GitHub Pages en Google Cloud Console
- Verifica las URLs en "Authorized JavaScript origins"

### OAuth no funciona:

- Verifica que el Client ID esté correctamente configurado
- Asegúrate de que el redirect URI coincida exactamente
- La URL debe incluir el path `/oauth-callback.html`

### API Key no funciona:

- Verifica que la API esté habilitada en Google Cloud
- Asegúrate de que el Sheet sea público o esté compartido

## Ejemplo Completo de Configuración

### .env (local):

```env
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=1ABC123xyz...
VITE_GOOGLE_SHEETS_SHEET_NAME=Candidatos
VITE_GOOGLE_SHEETS_API_KEY=AIza...
VITE_GOOGLE_OAUTH_CLIENT_ID=123-abc.apps.googleusercontent.com
```

### GitHub Secrets (producción):

```
VITE_GOOGLE_SHEETS_SPREADSHEET_ID = 1ABC123xyz...
VITE_GOOGLE_SHEETS_SHEET_NAME = Candidatos
VITE_GOOGLE_SHEETS_API_KEY = AIza...
VITE_GOOGLE_OAUTH_CLIENT_ID = 123-abc.apps.googleusercontent.com
```

### Workflow (.github/workflows/deploy.yml):

```yaml
- name: Build with Google Sheets configuration
  run: npm run build
  env:
    VITE_GOOGLE_SHEETS_SPREADSHEET_ID: ${{ secrets.VITE_GOOGLE_SHEETS_SPREADSHEET_ID }}
    VITE_GOOGLE_SHEETS_SHEET_NAME: ${{ secrets.VITE_GOOGLE_SHEETS_SHEET_NAME || 'Sheet1' }}
    VITE_GOOGLE_SHEETS_API_KEY: ${{ secrets.VITE_GOOGLE_SHEETS_API_KEY }}
    VITE_GOOGLE_OAUTH_CLIENT_ID: ${{ secrets.VITE_GOOGLE_OAUTH_CLIENT_ID }}
```

## Notas de Seguridad

1. **Nunca commitees `.env`** - está en `.gitignore` por una razón
2. **Usa siempre GitHub Secrets** para producción
3. **Limita el alcance de las API Keys** - solo lectura si es posible
4. **Revisa los logs** de GitHub Actions para verificar que los secrets se inyectan
5. **Rota las credenciales** periódicamente en Google Cloud Console

## Alternativa: Service Account (Backend)

Si necesitas mayor seguridad, considera usar un backend proxy con Service Account en lugar de exponer credenciales en el frontend. Esto requeriría:

1. Crear un backend (Cloud Functions, Express, etc.)
2. Usar Service Account en el backend
3. El frontend solo habla con tu backend

Este enfoque es más seguro pero requiere infraestructura adicional.
