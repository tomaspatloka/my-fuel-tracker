# 🚗 FuelTracker

Moderní PWA aplikace pro sledování spotřeby paliva vašeho vozidla s pokročilým error handlingem a logováním.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/fuel-tracker)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)

## ✨ Hlavní funkce

### 📊 Sledování a analýza
- **Záznamy tankování** - ukládejte každé tankování s detaily
- **Průměrná spotřeba** - automatický výpočet spotřeby na 100 km
- **Cena za kilometr** - sledujte provozní náklady
- **Sezónní statistiky** - porovnejte spotřebu v různých ročních obdobích
- **Grafy spotřeby** - vizualizace vývoje spotřeby v čase

### 🚙 Správa vozidel
- **Více vozidel** - spravujte neomezený počet aut
- **Detaily vozidla** - značka, model, typ motoru, objem nádrže
- **Přepínání vozidel** - rychlé přepnutí mezi auty
- **Export/Import dat** - záloha a přenos dat mezi zařízeními

### 📱 PWA Features
- **Offline režim** - aplikace funguje i bez internetu
- **Add to Home Screen** - instalace jako nativní aplikace
- **Rychlá & responzivní** - optimalizováno pro všechna zařízení
- **Material Design 3** - moderní a intuitivní UI

### 🛡️ Error Handling & Logging (v2.0)
- **Centralizované logování** - všechny události aplikace
- **5 úrovní závažnosti** - DEBUG, INFO, WARN, ERROR, FATAL
- **Persistentní logy** - chyby přežijí refresh stránky
- **Export logů** - pro debugging a analýzu
- **UI pro logy** - přehledné zobrazení v nastavení
- **Automatické zálohy** - ochrana před ztrátou dat
- **Validace dat** - komplexní kontrola všech vstupů
- **Error recovery** - automatická obnova při chybách

## 🚀 Quick Start

### Online verze (Doporučeno)

Navštivte: **[https://fuel-tracker.pages.dev](https://fuel-tracker.pages.dev)**

### Lokální instalace

```bash
# 1. Klonujte repository
git clone https://github.com/yourusername/fuel-tracker.git
cd fuel-tracker

# 2. Spusťte lokální server
python -m http.server 8000

# 3. Otevřete v prohlížeči
# http://localhost:8000
```

**Žádné dependencies!** Čistý JavaScript, HTML a CSS.

## 📖 Použití

### 1. Přidání vozidla

1. Přejděte do **Garáž**
2. Klikněte na **+ Nové**
3. Vyplňte údaje o vozidle
4. Uložte

### 2. Přidání tankování

1. Klikněte na **+ FAB button** (vpravo dole)
2. Nebo přejděte do záložky **Tankování**
3. Vyplňte:
   - Datum tankování
   - Stav tachometru (km)
   - Natankované litry
   - Cena za litr
   - Plná nádrž? (checkbox)
4. Uložte

### 3. Zobrazení statistik

- **Přehled** - rychlý souhrn a poslední tankování
- **Tankování** - kompletní historie
- **Statistiky** - detailní analýza, sezónní data

### 4. Export/Import dat

**Export:**
1. Nastavení → Exportovat data
2. Stáhne se JSON soubor

**Import:**
1. Nastavení → Importovat data
2. Vyberte JSON soubor
3. Data budou obnovena

## 🔧 Technologie

- **Frontend:** Vanilla JavaScript (ES6+)
- **UI:** Material Design 3 CSS
- **Icons:** Material Symbols
- **PWA:** Service Worker, Web App Manifest
- **Storage:** localStorage API
- **Deployment:** Cloudflare Pages
- **Logging:** Custom Logger utility
- **Error Handling:** Comprehensive try-catch with recovery

## 📁 Struktura projektu

```
FuelTracker/
├── index.html                 # Hlavní HTML
├── manifest.webmanifest       # PWA manifest
├── sw.js                      # Service Worker
├── _headers                   # Cloudflare headers
├── _redirects                 # Cloudflare redirects
├── package.json               # NPM konfigurace
├── css/
│   └── style.css             # Styly (Material Design)
├── js/
│   ├── logger.js             # Logging systém
│   ├── data.js               # Data management
│   └── app.js                # Aplikační logika
├── icons/
│   ├── icon-128.png          # PWA ikony
│   └── icon-512.png
└── docs/
    ├── ERROR_HANDLING_DOCUMENTATION.md
    ├── CHANGELOG.md
    └── DEPLOYMENT.md
```

## 🛠️ Development

### Požadavky

- Moderní webový prohlížeč (Chrome, Firefox, Safari, Edge)
- Python 3.x (pro lokální server) nebo jiný HTTP server
- Git (pro verzování)

### Setup

```bash
# Klonovat repo
git clone https://github.com/yourusername/fuel-tracker.git
cd fuel-tracker

# Spustit dev server
npm run dev
# nebo
python -m http.server 8000

# Otevřít http://localhost:8000
```

### Testování PWA

1. **Chrome DevTools**
   - F12 → Application tab
   - Zkontrolujte Service Worker
   - Zkontrolujte Manifest
   - Zkontrolujte Cache Storage

2. **Lighthouse**
   - F12 → Lighthouse tab
   - Spusťte PWA audit
   - Cílové skóre: 90+

3. **Offline test**
   - DevTools → Network → Offline
   - Refresh stránky
   - Aplikace by měla fungovat

## 🚀 Deployment

### Cloudflare Pages (Doporučeno)

Detailní návod: [DEPLOYMENT.md](DEPLOYMENT.md)

**Quick deploy:**

```bash
# Nainstalovat Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish . --project-name=fuel-tracker
```

### Alternativy

- **GitHub Pages** - Pro statické hostování
- **Netlify** - Automatický CI/CD
- **Vercel** - Rychlé nasazení
- **Firebase Hosting** - Google infrastruktura

## 🐛 Error Handling

### Zobrazení logů

1. Přejděte do **Nastavení**
2. Sekce **Ladění a logy**
3. Klikněte na **Zobrazit logy**

### Export logů

1. Nastavení → Ladění a logy
2. **Exportovat logy**
3. Stáhne se JSON soubor s logy

### Console logs

Otevřete browser console (F12) pro real-time logy:
- 🔵 INFO - běžné operace
- 🟡 WARN - varování
- 🔴 ERROR - chyby
- ⚫ FATAL - kritické chyby

## 📊 Validace dat

Aplikace validuje:

✅ **Povinná pole** - žádné pole nemůže být prázdné
✅ **Číselné rozsahy** - litry, cena, tachometr
✅ **Platnost data** - nemůže být v budoucnosti
✅ **Kapacita nádrže** - nelze natankovat více než kapacita
✅ **Cenové limity** - cena musí být v realistickém rozsahu (25-45 Kč/l)
✅ **Konzistence tachometru** - nové záznamy musí mít vyšší stav

## 🔒 Bezpečnost & Privacy

- ✅ **Žádné tracking** - aplikace nesleduje uživatele
- ✅ **Žádné servery** - vše běží lokálně
- ✅ **Žádné cookies** - nepoužíváme cookies
- ✅ **localStorage only** - data pouze ve vašem prohlížeči
- ✅ **HTTPS** - šifrovaná komunikace (na produkci)
- ✅ **CSP** - Content Security Policy
- ✅ **Security headers** - XSS, clickjacking ochrana

**Vaše data jsou pouze vaše!**

## 🌐 Prohlížeče

Podporované prohlížeče:

- ✅ Chrome 90+ (doporučeno)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

PWA funkce (offline, install):
- ✅ Chrome/Edge (plná podpora)
- ✅ Safari iOS 11.3+ (částečná podpora)
- ⚠️ Firefox (bez Add to Home Screen)

## 📱 Mobilní aplikace

### Android

1. Otevřete v Chrome
2. Menu → **Install app**
3. Potvrzení instalace

### iOS

1. Otevřete v Safari
2. Share button → **Add to Home Screen**
3. Potvrzení

## 🤝 Contributing

Příspěvky jsou vítány!

1. Fork repository
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

### Coding Standards

- ✅ Používejte ES6+ syntax
- ✅ Přidávejte komentáře k funkcím
- ✅ Používejte Logger místo console.log
- ✅ Validujte všechny vstupy
- ✅ Obalujte rizikové operace do try-catch
- ✅ Testujte na více prohlížečích

## 📄 Dokumentace

- [Error Handling Documentation](ERROR_HANDLING_DOCUMENTATION.md)
- [Changelog](CHANGELOG.md)
- [Deployment Guide](DEPLOYMENT.md)

## 📝 Licence

MIT License - viz [LICENSE](LICENSE) soubor

## 👨‍💻 Autor

Vytvořil: [Vaše jméno]
Email: your.email@example.com
GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Poděkování

- Material Design 3 za design systém
- Google Fonts za Roboto font a Material Symbols
- Cloudflare za hosting platformu

## 🗺️ Roadmap

### v2.1 (Plánováno)

- [ ] Exportní formáty (CSV, Excel)
- [ ] Grafické filtry (rozsah dat)
- [ ] Notifikace o servisu
- [ ] Tmavý režim automaticky podle systému
- [ ] Více jazykových mutací

### v3.0 (Budoucnost)

- [ ] Cloud sync (volitelně)
- [ ] Více grafů a vizualizací
- [ ] AI predikce spotřeby
- [ ] Export PDF reportů
- [ ] Sdílení vozidel (multi-user)

## 💡 FAQ

**Q: Funguje aplikace offline?**
A: Ano! Po první návštěvě se aplikace uloží do cache a funguje i bez internetu.

**Q: Kde se ukládají moje data?**
A: Všechna data se ukládají pouze do localStorage vašeho prohlížeče. Nikde na serveru.

**Q: Co když smažu cache prohlížeče?**
A: Data zůstanou zachována, cache se týká pouze aplikačních souborů. Ale raději pravidelně exportujte data jako zálohu.

**Q: Můžu mít více vozidel?**
A: Ano, můžete přidat neomezený počet vozidel.

**Q: Jak přenést data na nové zařízení?**
A: Exportujte data (JSON soubor) a importujte na novém zařízení.

**Q: Aplikace nefunguje po aktualizaci?**
A: Vymažte cache aplikace v DevTools (F12 → Application → Clear storage) a obnovte stránku.

---

**⭐ Pokud se vám aplikace líbí, dejte jí hvězdičku na GitHubu!**

[Report Bug](https://github.com/yourusername/fuel-tracker/issues) · [Request Feature](https://github.com/yourusername/fuel-tracker/issues) · [Documentation](https://github.com/yourusername/fuel-tracker/wiki)
