# FuelTracker - Changelog

## Verze 2.1.0 - Quick Wins Update (24.1.2026)

### ✨ Nové funkce

#### 1. Service Worker Update Notification
- **Automatická detekce aktualizací** - aplikace pozná, kdy je dostupná nová verze
- **Update banner** - vizuální notifikace o dostupné aktualizaci
- **Jednoklikové update** - tlačítko pro okamžitou aktualizaci
- **Logging update procesu** - sledování instalace nové verze
- **Plynulý přechod** - automatický reload po aktivaci nové verze

#### 2. CSV Export
- **Export do CSV** - export tankování do CSV formátu
- **Excel kompatibilita** - BOM header pro správné zobrazení v Excelu
- **Kalkulované hodnoty** - automatický výpočet spotřeby a vzdálenosti
- **UTF-8 podpora** - správné zobrazení českých znaků
- **Pojmenované soubory** - název obsahuje jméno vozidla a timestamp
- **Detailní data** - všechny informace včetně poznámek

#### 3. Auto Dark Mode
- **Systémová detekce** - automatická detekce tmavého režimu systému
- **Dynamické přepínání** - reaguje na změny systémového nastavení
- **Volitelný manuál** - možnost vypnout auto režim a ovládat ručně
- **Logging změn** - zaznamenávání změn tématu
- **Plynulé přechody** - hladké animace při přepnutí

#### 4. Data Migration System
- **Verzování dat** - každá verze dat má číslo (v2.1.0)
- **Automatická migrace** - upgrade z  starších verzí
- **Zachování kompatibility** - stará data fungují i v nové verzi
- **Migrace logů** - sledování migračního procesu
- **Bezpečná migrace** - try-catch pro ochranu dat
- **Notifikace** - uživatel je informován o migraci

### 🔧 Vylepšení

#### Service Worker (sw.js)
- Aktualizována verze na v2.1.0
- Vylepšené logování instalace a aktivace
- Message handler pro SKIP_WAITING

#### DataManager (js/data.js)
- Přidána konstanta DATA_VERSION
- Přidán version field do state
- Nová metoda _migrateData()
- Podpora darkModeAuto v settings
- Vylepšené applySettings() s auto detekci
- Event listener pro system theme changes

#### App.js
- Nová funkce exportCSV()
- Nová funkce toggleAutoDarkMode()
- UI pro CSV export v nastavení
- Kondicionální zobrazení manuálního dark mode
- Vylepšené nastavení vzhledu

#### Index.html
- Update banner HTML
- Vylepšená SW registrace s update detection
- Global updateApp() function
- Event listeners pro controllerchange

#### CSS (style.css)
- .update-banner styly
- slideDown animace
- Responzivní design banneru

### 📊 Statistiky

- **Přidáno:** ~200 řádků kódu
- **Nových funkcí:** 4 hlavní + 6 pomocných
- **Vylepšených souborů:** 6
- **Nová CSS pravidla:** 8

### 🐛 Opravené chyby

- Opravena chybějící darkModeAuto při první instalaci
- Vylepšena detekce změn systémového tématu
- Opraveno CSV encoding pro Excel

### 📝 Dokumentace

- Aktualizován CHANGELOG
- Aktualizována verze v package.json
- Aktualizována verze v sw.js
- Aktualizována verze v data.js

---

## Verze 2.0.0 - Error Handling & Logging Update (24.1.2026)

### ✨ Nové funkce

#### 1. Komplexní systém logování
- **Logger utility** (`js/logger.js`) s 5 úrovněmi závažnosti (DEBUG, INFO, WARN, ERROR, FATAL)
- **Automatické logování** všech důležitých událostí v aplikaci
- **Persistentní ukládání** kritických chyb do localStorage
- **Export logů** do JSON pro debugging
- **Zobrazení logů** v uživatelském rozhraní (Nastavení → Ladění a logy)

#### 2. Robustní ošetření chyb
- **Global error handler** - zachytává všechny nezachycené chyby
- **Promise rejection handler** - ošetření async chyb
- **Try-catch bloky** ve všech kritických funkcích
- **Error recovery** - automatická obnova při chybách

#### 3. Validace dat
- **Validace vstupů** s detailními chybovými hláškami
- **Kontrola rozsahů** pro všechny číselné hodnoty
- **Validace dat** - kontrola platnosti a budoucnosti
- **Kontrola integrity dat** - automatické čištění neplatných záznamů
- **Ošetření poškozených dat** s automatickou zálohou

#### 4. DOM Helper
- **DomHelper utility** pro bezpečné operace s DOM
- **Izolované event handlery** - chyba v jednom handleru neovlivní ostatní
- **Fallback UI** při chybách vykreslování

#### 5. Správa úložiště
- **QuotaExceededError handling** - automatické čištění při plném úložišti
- **Automatické zálohy** poškozených dat
- **Čištění starých záloh** pro uvolnění místa

### 🔧 Vylepšení

#### DataManager (js/data.js)
- Validace všech operací s daty
- Logování všech změn stavu
- Odstranění osiřelých záznamů
- Kontrola konzistence tachometru
- Kontrola kapacity nádrže
- Kontrola cenových limitů

#### App.js
- Error handling ve všech funkcích
- Detailní validace formulářů
- Informativní chybové hlášky v češtině
- Bezpečnější import/export dat
- Automatický refresh po operacích

#### Nastavení
- **Nová sekce "Ladění a logy"**
  - Zobrazit logy (s počtem chyb)
  - Exportovat logy
  - Smazat logy
- Lepší struktura nastavení s kategoriemi

### 📝 Změny v souborech

#### Nové soubory:
- `js/logger.js` - Logger a ErrorHandler utility
- `ERROR_HANDLING_DOCUMENTATION.md` - Kompletní dokumentace
- `CHANGELOG.md` - Seznam změn

#### Upravené soubory:
- `index.html` - Přidán import logger.js
- `js/data.js` - Přidáno komplexní error handling a validace
- `js/app.js` - Přidán DomHelper, error handling, log viewer

### 🐛 Opravené chyby

- Ošetřena chyba při poškozeném localStorage
- Opraveno chování při plném úložišti
- Ošetřeny DOM chyby při chybějících elementech
- Opravena validace při editaci starších záznamů
- Ošetřeny Parse errors při importu dat

### 📖 Dokumentace

- Vytvořena kompletní dokumentace error handlingu
- Popis všech Logger funkcí
- Best practices pro vývojáře
- Návod pro debugging
- Doporučení pro uživatele

### 🎯 Technické detaily

#### Úrovně logování:
- **DEBUG (0)** - Detailní informace pro ladění
- **INFO (1)** - Běžné informativní zprávy [výchozí]
- **WARN (2)** - Varování o potenciálních problémech
- **ERROR (3)** - Chyby nebrání ící běhu
- **FATAL (4)** - Kritické chyby

#### Validace:
- ✅ Povinná pole
- ✅ Číselné rozsahy
- ✅ Platnost data
- ✅ Konzistence tachometru
- ✅ Kapacita nádrže
- ✅ Cenové limity

#### Persisten ce:
- 100 nejnovějších logů v paměti
- 50 posledních chyb v localStorage
- Automatické zálohy poškozených dat
- Exportovatelné logy ve formátu JSON

### 🚀 Budoucí vylepšení

- [ ] Offline mode s Service Worker error handling
- [ ] Analytics pro sledování chyb
- [ ] Automatické reporting kritických chyb
- [ ] Advanced debugging mode
- [ ] Performance monitoring

### 📊 Statistiky

- **Přidáno:** ~400 řádků kódu pro error handling
- **Nové funkce:** 25+
- **Validační kontroly:** 10+
- **Zachycené chyby:** Všechny kategorie

---

**Datum vydání:** 24. ledna 2026
**Typ vydání:** Major Update
**Priorita:** Vysoká (zlepšení stability a debugovatelnosti)
