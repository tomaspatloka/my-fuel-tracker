# 🚀 Cloudflare Pages - Quick Deploy Guide

## ⚡ Rychlý start (5 minut)

### Krok 1: Vytvořte GitHub Repository

```bash
# Jste již ve složce MyFuelTracker s Git inicializovaným ✅

# 1. Vytvořte nový repository na GitHubu
# Jděte na: https://github.com/new
# Název: my-fuel-tracker (nebo jiný)
# Veřejný nebo Soukromý: dle preference
# NEINICIALIZUJTE s README (už máte!)

# 2. Připojte remote (nahraďte USERNAME)
git remote add origin https://github.com/USERNAME/my-fuel-tracker.git

# 3. Push do GitHubu
git branch -M main
git push -u origin main
```

✅ **Repository je na GitHubu!**

---

### Krok 2: Nasaďte na Cloudflare Pages

#### A) Přes Cloudflare Dashboard (Nejjednodušší)

1. **Přihlaste se na Cloudflare**
   - URL: https://dash.cloudflare.com/
   - Vytvořte účet pokud nemáte (zdarma)

2. **Vytvořte Pages projekt**
   - Klikněte: **Workers & Pages** (levé menu)
   - Klikněte: **Create application**
   - Vyberte: **Pages**
   - Klikněte: **Connect to Git**

3. **Připojte GitHub**
   - Autorizujte Cloudflare pro GitHub
   - Vyberte repository: `my-fuel-tracker`
   - Klikněte: **Begin setup**

4. **Nastavte build**
   ```
   Project name: my-fuel-tracker
   Production branch: main

   Build settings:
   ┌─────────────────────────────────┐
   │ Framework preset: None          │
   │ Build command: (PRÁZDNÉ)        │
   │ Build output directory: /       │
   │ Root directory: (PRÁZDNÉ)       │
   └─────────────────────────────────┘
   ```

5. **Deploy!**
   - Klikněte: **Save and Deploy**
   - Čekejte 1-2 minuty
   - Hotovo! 🎉

6. **Vaše URL**
   ```
   https://my-fuel-tracker.pages.dev
   ```

---

#### B) Přes Wrangler CLI (Pro pokročilé)

```bash
# 1. Nainstalujte Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Deploy
cd C:/Users/tpatl/Desktop/MyFuelTracker
wrangler pages deploy . --project-name=my-fuel-tracker

# První deploy vytvoří projekt
# Další deploye pouze updatují
```

---

## ✅ Verify Deployment

Po nasazení zkontrolujte:

1. **Aplikace se načte**
   - Otevřete URL v prohlížeči
   - Měli byste vidět FuelTracker

2. **Service Worker funguje**
   - F12 → Application → Service Workers
   - Měl by být registrován SW v2.1.0

3. **PWA instalovatelná**
   - Chrome: Ikona install v address baru
   - Mobile: "Add to Home Screen"

4. **Offline mode**
   - DevTools → Network → Offline
   - Refresh → Aplikace stále funguje

5. **Všechny funkce**
   - Přidat vozidlo ✓
   - Přidat tankování ✓
   - Zobrazit statistiky ✓
   - Export CSV ✓
   - Export JSON ✓
   - Dark mode ✓

---

## 🔄 Aktualizace (Budoucí změny)

```bash
# 1. Proveďte změny v kódu
# 2. Commit
git add .
git commit -m "Update: popis změny"

# 3. Push
git push origin main

# 4. Cloudflare automaticky nasadí!
# Sledujte na: https://dash.cloudflare.com/pages
```

---

## 🌐 Custom Domain (Volitelné)

### Pokud máte vlastní doménu:

1. **V Cloudflare Dashboard**
   - Jděte na váš Pages projekt
   - **Custom domains** → **Set up a custom domain**
   - Zadejte: `fueltracker.cz` (váš domain)

2. **DNS se nastaví automaticky**
   - Pokud je doména na Cloudflare
   - SSL certifikát se vytvoří automaticky

3. **Pokud doména NENÍ na Cloudflare**
   - Přidejte CNAME záznam:
   ```
   CNAME @ my-fuel-tracker.pages.dev
   ```

---

## 📊 Cloudflare Analytics

Po nasazení máte přístup k:

- **Requests** - počet požadavků
- **Bandwidth** - přenesená data
- **Page views** - návštěvy
- **Unique visitors** - unikátní návštěvníci
- **Geographic data** - odkud uživatelé přicházejí

Dashboard: `https://dash.cloudflare.com/pages/YOUR-PROJECT/analytics`

---

## 🐛 Troubleshooting

### Aplikace se nenačte

**Problém:** 404 nebo chyba
**Řešení:**
```bash
# Zkontrolujte build settings
Build output directory: /  (ne /dist nebo /build)
Root directory: (prázdné)
```

### Service Worker nefunguje

**Problém:** SW se neregistruje
**Řešení:**
- Funguje pouze na HTTPS (Cloudflare má automaticky)
- Vyčistěte cache: DevTools → Clear storage

### Změny se neprojevují

**Problém:** Vidím starou verzi
**Řešení:**
```bash
# 1. Tvrdý refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 2. Vyčistěte Cloudflare cache
Dashboard → Caching → Purge Everything

# 3. Počkejte na update banner
Aplikace zobrazí notifikaci o nové verzi
```

### Git push selhává

**Problém:** Permission denied
**Řešení:**
```bash
# Nastavte Git credentials
git config --global user.name "Vaše Jméno"
git config --global user.email "vas@email.com"

# Nebo použijte Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens
```

---

## 📦 Struktura projektu

```
MyFuelTracker/
├── index.html              ✅ Hlavní stránka
├── manifest.webmanifest    ✅ PWA manifest
├── sw.js                   ✅ Service Worker v2.1.0
├── _headers                ✅ Cloudflare security headers
├── _redirects              ✅ SPA redirects
├── .gitignore              ✅ Git ignore
├── package.json            ✅ Project metadata
├── README.md               ✅ Dokumentace
├── LICENSE                 ✅ MIT License
├── CHANGELOG.md            ✅ Seznam změn
├── DEPLOYMENT.md           ✅ Detailní deployment guide
├── css/
│   └── style.css           ✅ Material Design styles
├── js/
│   ├── logger.js           ✅ Logging systém
│   ├── data.js             ✅ Data management
│   └── app.js              ✅ App logika
└── icons/
    ├── icon-128.png        ✅ PWA ikony
    └── icon-512.png        ✅
```

---

## 🎯 Production Checklist

Před finálním nasazením:

- [x] ✅ Git repository vytvořen
- [x] ✅ První commit proveden
- [ ] ⬜ GitHub repository vytvořen
- [ ] ⬜ Remote origin nastaven
- [ ] ⬜ Pushed na GitHub
- [ ] ⬜ Cloudflare Pages projekt vytvořen
- [ ] ⬜ Build settings správně
- [ ] ⬜ První deployment úspěšný
- [ ] ⬜ URL funguje
- [ ] ⬜ PWA instalovatelná
- [ ] ⬜ Service Worker aktivní
- [ ] ⬜ Offline mode funkční
- [ ] ⬜ All features tested
- [ ] ⬜ Custom domain (volitelné)

---

## 💡 Pro Tips

### 1. Preview Deployments
Každá branch automaticky dostane preview URL:
```
main → https://my-fuel-tracker.pages.dev
feature-x → https://feature-x.my-fuel-tracker.pages.dev
```

### 2. Rollback
V Cloudflare můžete vrátit na předchozí verzi:
- Dashboard → Deployments → Rollback

### 3. Environment Variables
Pro budoucí API klíče:
- Dashboard → Settings → Environment variables

### 4. Build Notifications
Nastavte Slack/Discord/Email notifikace:
- Dashboard → Settings → Notifications

---

## 🎉 Hotovo!

Vaše aplikace je nyní:
- ✅ Live na internetu
- ✅ Dostupná 24/7
- ✅ Na global CDN (rychlá po celém světě)
- ✅ S automatickým HTTPS
- ✅ S automatickými deploymenty

**URL:** `https://my-fuel-tracker.pages.dev`

---

## 📞 Support

Máte problém?

1. Zkontrolujte [DEPLOYMENT.md](DEPLOYMENT.md) pro detaily
2. Podívejte se na [Cloudflare Docs](https://developers.cloudflare.com/pages/)
3. Otevřete issue na GitHubu

---

**Happy deploying! 🚀**
