# Transtel Billing Application

An offline-first Electron desktop application for PABX billing and call accounting.

## Features (MVP)
- **Call Accounting**: Listen for SMDR data via TCP (Port 5008).
- **Extension Management**: Manage extensions, tenants, and lines.
- **Dashboard**: Real-time view of call activity.
- **Data Storage**: Local PouchDB database (offline capable).
- **Billing**: Basic cost calculation.

## Prerequisites
- Node.js 18+ (Recommended 20.x)
- Windows 10/11

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

## Development

Run the application in development mode (hot-reload):

```bash
npm run dev
```

This will start:
- Vite dev server (Renderer process) on port 5173
- Electron app (Main process)

## Building for Production

Build the Windows installer:

```bash
npm run build
```

The output installer will be in the `dist` folder.

## SMDR Configuration

The application listens on TCP port **5008** by default for SMDR records.
Format expected: `PS|RN3100|PTT|DU000003|DA251125|TI152807|DD54356600|`

## License
Proprietary - Transtel Communications
