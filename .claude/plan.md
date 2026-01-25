# Plán implementace Cloud Sync pro MyFuelTracker

## Přehled
Implementace Cloudflare KV synchronizace dat podle vzoru z MyFitnessApp.

## Co bude implementováno

### 1. Backend - Cloudflare Pages Function
**Soubor:** `functions/api/sync.js`

- GET endpoint pro stažení dat z cloudu
- POST endpoint pro nahrání dat do cloudu
- OPTIONS endpoint pro CORS
- Použití KV namespace: `FUEL_DATA`
- Data expirují za 1 rok

### 2. Frontend - Sync modul
**Soubor:** `js/sync.js`

- `CloudSync` objekt s metodami:
  - `getUserId()` - získá nebo vytvoří unikátní ID uživatele
  - `pushToCloud()` - nahraje data do cloudu
  - `pullFromCloud()` - stáhne data z cloudu
  - `fullSync()` - kompletní synchronizace (pull + push)
  - `mergeData()` - sloučí cloudová data s lokálními
  - `getSyncStatus()` - stav pro UI
  - `copyUserId()` - zkopíruje ID do schránky
  - `setUserId()` - nastaví ID (pro obnovení dat)

- Event listenery:
  - `visibilitychange` - auto-sync při návratu do aplikace
  - `online/offline` - detekce připojení

### 3. Úpravy v data.js
- Přidat `cloudSync: false` do výchozího nastavení

### 4. Úpravy v app.js
- Přidat UI sekci "Cloud synchronizace" do nastavení
- Funkce `toggleCloudSync()`, `syncNow()`, `showSyncId()`, `restoreFromId()`

### 5. Úpravy v index.html
- Přidat `<script src="js/sync.js"></script>`

### 6. Aktualizace CSP v _headers
- Přidat `/api/*` do povolených connect-src (není potřeba - je to same-origin)

## Cloudflare KV Setup (manuálně v dashboardu)
Po deployi je potřeba:
1. Vytvořit KV namespace `FUEL_DATA` v Cloudflare dashboardu
2. Přiřadit binding v Pages > Settings > Functions > KV namespace bindings

## Soubory k vytvoření
- `functions/api/sync.js`
- `js/sync.js`

## Soubory k úpravě
- `js/data.js` - přidat cloudSync do settings
- `js/app.js` - přidat UI a funkce pro sync
- `index.html` - přidat script tag

## Verze
- Zvýšit CACHE_VERSION v sw.js na v2.3.0
- Zvýšit DATA_VERSION v data.js na 2.2.0
