# FuelTracker - Deployment na Cloudflare Pages

## 📋 Přehled

FuelTracker je připraven k nasazení na Cloudflare Pages jako statická PWA aplikace. Aplikace běží kompletně na straně klienta a ukládá data do localStorage.

## 🚀 Nasazení krok za krokem

### Metoda 1: Přes Cloudflare Dashboard (Doporučeno)

#### 1. Připravte Git repository

```bash
# Inicializujte git (pokud ještě není)
cd C:\Users\tpatl\Desktop\FuelTracker
git init

# Přidejte všechny soubory
git add .

# Vytvořte první commit
git commit -m "Initial commit - FuelTracker v2.0"

# Vytvořte repository na GitHubu/GitLabu
# Poté připojte remote
git remote add origin <VÁŠ_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

#### 2. Připojte k Cloudflare Pages

1. Přihlaste se do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Přejděte na **Workers & Pages** → **Pages**
3. Klikněte na **Create a project**
4. Vyberte **Connect to Git**
5. Autorizujte GitHub/GitLab
6. Vyberte repository `FuelTracker`

#### 3. Konfigurace build settings

Na stránce konfigurace nastavte:

```yaml
Framework preset: None
Build command: (ponechte prázdné)
Build output directory: /
Root directory: /
Environment variables: (žádné nejsou potřeba)
```

**Důležité:** FuelTracker je čistá statická aplikace, nepotřebuje build proces!

#### 4. Deployment

1. Klikněte na **Save and Deploy**
2. Cloudflare automaticky nasadí aplikaci
3. Po dokončení získáte URL: `https://fuel-tracker.pages.dev`

### Metoda 2: Wrangler CLI (Pokročilé)

#### 1. Instalace Wrangler

```bash
npm install -g wrangler

# Přihlášení
wrangler login
```

#### 2. Vytvoření projektu

```bash
cd C:\Users\tpatl\Desktop\FuelTracker

# Vytvoření Pages projektu
wrangler pages project create fuel-tracker
```

#### 3. Deploy

```bash
# První nasazení
wrangler pages publish . --project-name=fuel-tracker

# Další nasazení
wrangler pages publish .
```

## 📁 Struktura projektu pro deployment

```
FuelTracker/
├── index.html              # Hlavní HTML soubor
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker
├── _headers                # Cloudflare headers konfigurace
├── _redirects              # Cloudflare redirects konfigurace
├── .gitignore              # Git ignore soubor
├── css/
│   └── style.css          # Styly aplikace
├── js/
│   ├── logger.js          # Logging systém
│   ├── data.js            # Data management
│   └── app.js             # Aplikační logika
├── icons/
│   ├── icon-128.png       # PWA ikona 128x128
│   └── icon-512.png       # PWA ikona 512x512
└── docs/
    ├── ERROR_HANDLING_DOCUMENTATION.md
    ├── CHANGELOG.md
    └── DEPLOYMENT.md
```

## ⚙️ Konfigurace

### _headers soubor

Soubor `_headers` obsahuje:
- ✅ Bezpečnostní hlavičky (XSS, CSRF ochrana)
- ✅ Content Security Policy
- ✅ Cache control pro optimální výkon
- ✅ Service Worker povolení

### _redirects soubor

Soubor `_redirects` obsahuje:
- ✅ SPA fallback na index.html
- ✅ HTTPS redirect

### Service Worker (sw.js)

Optimalizovaný Service Worker v2.0.0:
- ✅ Offline podpora
- ✅ Asset caching
- ✅ Network-first strategie
- ✅ Automatické čištění starých cache
- ✅ Error handling
- ✅ Logging

## 🔒 Bezpečnost

### Implementované bezpečnostní opatření:

1. **Content Security Policy (CSP)**
   - Omezení načítání zdrojů pouze z důvěryhodných domén
   - Ochrana proti XSS útokům

2. **Security Headers**
   - `X-Frame-Options: DENY` - ochrana proti clickjackingu
   - `X-Content-Type-Options: nosniff` - ochrana proti MIME sniffing
   - `X-XSS-Protection` - XSS filter

3. **HTTPS Only**
   - Automatický redirect z HTTP na HTTPS
   - Secure cookies (pro budoucí použití)

4. **Data Privacy**
   - Všechna data pouze v localStorage
   - Žádná komunikace se serverem
   - Žádné tracking nebo analytics

## 🌐 Custom Domain (Volitelné)

### Přidání vlastní domény

1. V Cloudflare Dashboard přejděte na váš Pages projekt
2. Klikněte na **Custom domains**
3. Přidejte svou doménu (např. `fueltracker.cz`)
4. Cloudflare automaticky vystaví SSL certifikát

### DNS nastavení

Pokud doména není na Cloudflare:

```
CNAME @ fuel-tracker.pages.dev
```

Pokud doména je na Cloudflare:
- DNS se nastaví automaticky

## 📊 Monitorování

### Cloudflare Analytics

Po nasazení máte přístup k:
- **Page views** - počet návštěv
- **Bandwidth** - přenesená data
- **Requests** - počet požadavků
- **Geographic distribution** - odkud uživatelé přicházejí

### Console logs

Service Worker a aplikace logují do konzole:
- Install/Activate události
- Cache operace
- Fetch requesty
- Chyby a varování

## 🔄 Aktualizace aplikace

### Automatické nasazení (CI/CD)

Při pushu do `main` branch se Cloudflare automaticky:
1. Stáhne novou verzi
2. Nasadí na Pages
3. Aktivuje novou verzi
4. Provede atomic deployment (zero downtime)

### Manuální aktualizace

```bash
# Proveďte změny v kódu
git add .
git commit -m "Update: popis změny"
git push origin main

# Cloudflare automaticky nasadí
```

### Verze Service Workeru

Při změnách v SW nezapomeňte aktualizovat verzi:

```javascript
// sw.js
const CACHE_VERSION = 'v2.0.1'; // Zvyšte verzi
```

## 🧪 Testování před nasazením

### Lokální test

```bash
# Spusťte lokální server
python -m http.server 8000

# Otevřete v prohlížeči
# http://localhost:8000
```

### Test PWA

1. Otevřete DevTools (F12)
2. Záložka **Application**
3. Zkontrolujte:
   - Service Worker je registrován
   - Manifest je validní
   - Cache obsahuje assety
   - localStorage funguje

### Test offline režimu

1. DevTools → Network → Offline
2. Obnovte stránku
3. Aplikace by měla fungovat offline

## 📱 PWA Features

### Co funguje po nasazení:

✅ **Add to Home Screen**
- iOS: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Install app

✅ **Offline Mode**
- Aplikace funguje bez internetu
- Všechna data v localStorage

✅ **App-like Experience**
- Běží na celou obrazovku
- Vlastní ikona na ploše
- Splash screen

## 🐛 Troubleshooting

### Aplikace se nenačte

**Příčina:** Service Worker cache
**Řešení:**
1. DevTools → Application → Clear storage
2. Obnovte stránku (Ctrl+Shift+R)

### Změny se neprojevují

**Příčina:** Cloudflare cache nebo SW cache
**Řešení:**
1. Zvyšte `CACHE_VERSION` v sw.js
2. Vyčistěte Cloudflare cache v dashboardu
3. Hard refresh (Ctrl+Shift+R)

### Service Worker nefunguje

**Příčina:** Není HTTPS
**Řešení:**
- SW funguje pouze na HTTPS (kromě localhost)
- Zkontrolujte, že používáte HTTPS URL

### Data se ztratila

**Příčina:** Vyčištěný localStorage
**Řešení:**
- Pravidelně exportujte data (Nastavení → Exportovat)
- Kontrolujte zálohy v localStorage (corrupted backups)

## 📈 Optimalizace výkonu

### Již implementováno:

✅ **Caching Strategy**
- Statické assety: 1 rok
- HTML: No cache (always fresh)
- SW: No cache

✅ **Asset Optimization**
- Minifikace CSS (doporučeno)
- Komprese obrázků
- Lazy loading (kde možné)

✅ **Service Worker**
- Offline-first strategie
- Asset pre-caching
- Runtime caching

### Doporučená další vylepšení:

1. **Minifikace**
```bash
# Nainstalujte build tools
npm install -g terser csso-cli

# Minifikujte JS
terser js/app.js -o js/app.min.js
terser js/data.js -o js/data.min.js
terser js/logger.js -o js/logger.min.js

# Minifikujte CSS
csso css/style.css -o css/style.min.css

# Aktualizujte odkazy v index.html
```

2. **Image Optimization**
```bash
# Použijte WebP formát pro lepší kompresi
# Nebo službu jako TinyPNG pro optimalizaci PNG
```

## 🔐 Environment Variables (Budoucí použití)

Pokud budete potřebovat API klíče nebo jiné proměnné:

```bash
# V Cloudflare Dashboard
Settings → Environment variables

# Přidejte proměnné pro Production
PRODUCTION:
  API_KEY=xxx

# Pro Preview/Development
PREVIEW:
  API_KEY=xxx-dev
```

## 🌍 Multi-region Deployment

Cloudflare Pages automaticky:
- Nasazuje do všech 300+ datacenters
- Poskytuje global CDN
- Optimalizuje latenci
- Zabezpečuje proti DDoS

**Není potřeba žádná konfigurace!**

## 📞 Support & Troubleshooting

### Cloudflare Support
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Community Forums](https://community.cloudflare.com/)
- [Status Page](https://www.cloudflarestatus.com/)

### FuelTracker Issues
- Zkontrolujte logy v Nastavení → Zobrazit logy
- Exportujte logy pro analýzu
- Zkontrolujte browser console (F12)

## 🎉 Po nasazení

### Checklist:

- [ ] Aplikace je dostupná na URL
- [ ] HTTPS funguje
- [ ] Service Worker je aktivní
- [ ] PWA lze nainstalovat
- [ ] Offline režim funguje
- [ ] Data se ukládají do localStorage
- [ ] Všechny stránky se načítají
- [ ] Logy jsou k dispozici v nastavení

### Sdílení:

Vaše aplikace je dostupná na:
```
https://fuel-tracker.pages.dev
```

Nebo na vlastní doméně:
```
https://vase-domena.cz
```

---

**Gratulujeme! 🎊 FuelTracker je nyní live na Cloudflare Pages!**

Pro otázky nebo problémy otevřete issue v GitHub repository.
