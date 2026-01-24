# 🎉 FuelTracker v2.1.0 - Release Notes

**Datum vydání:** 24. ledna 2026
**Typ:** Minor Update (Quick Wins)
**Build čas:** ~50 minut

---

## 📦 Co je nového?

### 1. 🔔 Service Worker Update Notification

Aplikace vás nyní upozorní, když je dostupná nová verze!

**Jak to funguje:**
- Při návštěvě stránky se automaticky kontroluje nová verze
- Pokud je dostupná, zobrazí se modrý banner nahoře
- Klikněte na "Aktualizovat" pro okamžitý update
- Stránka se obnoví s novou verzí

**Výhody:**
- ✅ Vždy máte nejnovější funkce
- ✅ Automatické bezpečnostní updaty
- ✅ Žádné manuální obnovování
- ✅ Uživatelsky přívětivé

**Technické:**
```javascript
// Detekuje nový Service Worker
reg.addEventListener('updatefound', () => {
    // Zobrazí banner s tlačítkem
    showUpdateBanner();
});
```

---

### 2. 📊 CSV Export

Export vašich dat do CSV pro Excel, Google Sheets a další!

**Funkce:**
- Export všech tankování aktuálního vozidla
- Automatický výpočet spotřeby a vzdálenosti
- Excel-ready (BOM header pro UTF-8)
- České znaky správně zobrazeny
- Strukturované sloupce

**Exportované sloupce:**
```
1. Datum
2. Stav tachometru (km)
3. Natankováno (l)
4. Cena za litr (Kč)
5. Celková cena (Kč)
6. Plná nádrž (Ano/Ne)
7. Poznámka
8. Spotřeba (l/100km)
9. Ujetá vzdálenost (km)
```

**Jak použít:**
1. Nastavení → Data
2. "Exportovat do CSV"
3. Soubor se stáhne
4. Otevřete v Excelu/Sheets

**Příklad názvu souboru:**
```
fuel_tracker_Octavia_1737743234567.csv
```

---

### 3. 🌓 Auto Dark Mode

Tmavý režim se automaticky přizpůsobí vašemu systému!

**Funkce:**
- Detekce systémového nastavení
- Automatické přepnutí při změně systému
- Volitelný manuální režim
- Plynulé přechody

**Jak to funguje:**
```
System: Light → App: Light
System: Dark  → App: Dark
```

**Nastavení:**
1. Nastavení → Vzhled
2. "Auto tmavý režim" - zapnuto (default)
3. Nebo vypněte a ovládejte ručně

**API:**
```javascript
window.matchMedia('(prefers-color-scheme: dark)');
```

---

### 4. 🔄 Data Migration System

Vaše data jsou nyní verzovaná a bezpečně migrovatelná!

**Proč je to důležité:**
- Budoucí updaty můžou změnit strukturu dat
- Automatická migrace bez ztráty dat
- Stará záloha funguje i v nové verzi
- Bezpečná cesta k novým funkcím

**Verzování:**
```
v1.x → v2.0.x → v2.1.0
```

**Co se děje při migraci:**
1. Detekce staré verze
2. Kontrola změn struktury
3. Přidání nových polí
4. Update version čísla
5. Uložení migrovaných dat
6. Notifikace uživatele

**Příklad migrace:**
```javascript
// Z verze 2.0.x na 2.1.0
if (!settings.darkModeAuto) {
    settings.darkModeAuto = true; // Přidá nové pole
}
state.version = '2.1.0'; // Update verze
```

---

## 🔧 Technické detaily

### Změněné soubory

#### 1. `index.html`
```diff
+ Update banner HTML
+ Vylepšená SW registrace
+ Update detection logic
```

#### 2. `sw.js`
```diff
- const CACHE_VERSION = 'v2.0.0';
+ const CACHE_VERSION = 'v2.1.0';
```

#### 3. `js/data.js`
```diff
+ DATA_VERSION = '2.1.0'
+ state.version
+ state.settings.darkModeAuto
+ _migrateData() metoda
+ Vylepšené applySettings()
```

#### 4. `js/app.js`
```diff
+ exportCSV() funkce
+ toggleAutoDarkMode() funkce
+ CSV export UI
+ Auto dark mode UI
```

#### 5. `css/style.css`
```diff
+ .update-banner styly
+ @keyframes slideDown
```

#### 6. `package.json`
```diff
- "version": "2.0.0"
+ "version": "2.1.0"
```

### API Changes

**Nové funkce:**
```javascript
window.updateApp()           // Aktualizace aplikace
exportCSV()                  // CSV export
toggleAutoDarkMode()         // Toggle auto dark mode
DataManager._migrateData()   // Data migration
```

**Nové konstanty:**
```javascript
DataManager.DATA_VERSION = '2.1.0'
```

**Nová pole v state:**
```javascript
state.version = '2.1.0'
state.settings.darkModeAuto = true
```

---

## 📊 Srovnání verzí

| Feature | v2.0.0 | v2.1.0 |
|---------|--------|--------|
| Error Handling | ✅ | ✅ |
| Logging | ✅ | ✅ |
| JSON Export | ✅ | ✅ |
| CSV Export | ❌ | ✅ |
| Dark Mode | Manual | Auto + Manual |
| Update Notification | ❌ | ✅ |
| Data Migration | ❌ | ✅ |
| Service Worker | v2.0.0 | v2.1.0 |

---

## 🚀 Upgrade Guide

### Z v2.0.0 na v2.1.0

**Automatická migrace:**
1. Otevřete aplikaci
2. Data se automaticky migrují
3. Uvidíte notifikaci "Data aktualizována"
4. Hotovo! ✅

**Co se stane:**
- Přidá se `version: '2.1.0'`
- Přidá se `darkModeAuto: true`
- Data zůstanou zachována
- Žádná akce od vás není potřeba

**Pokud máte problémy:**
1. Exportujte data (JSON backup)
2. Vyčistěte cache (DevTools → Clear storage)
3. Obnovte stránku
4. Importujte data zpět

---

## 💡 Tipy & Triky

### CSV Export
```
💡 Otevřete CSV v Excelu → Data → From Text/CSV
💡 Použijte pivot tabulky pro analýzu
💡 Vytvořte grafy spotřeby v čase
```

### Auto Dark Mode
```
💡 Funguje na Windows, Mac i mobilech
💡 Vypněte pro manuální kontrolu
💡 Šetří baterii na OLED displejích
```

### Update Notifications
```
💡 Banner zmizí po aktualizaci
💡 Update je instant (1-2 sekundy)
💡 Nová verze = nové funkce!
```

---

## 🐛 Known Issues

### Minor:
- CSV export exportuje pouze aktivní vozidlo (by design)
- Update banner se nezobrazí při file:// protokolu (lokální test)
- Dark mode transition může být viditelná na starších zařízeních

### Workarounds:
- Pro export všech vozidel: přepněte vozidlo a exportujte znovu
- Testujte update na HTTPS (Cloudflare Pages)
- CSS transition lze vypnout v settings (budoucí feature)

---

## 📈 Performance

### Optimalizace v2.2.1:
- CSV export: O(n) komplexita
- Auto dark mode: Event listener (minimální overhead)
- Migration: Jednorázový při startu
- Update detection: Pasivní (SW handled)

### Velikost:
```
v2.0.0: ~45 KB (všechny soubory)
v2.1.0: ~48 KB (+3 KB)

Breakdown:
  app.js:    +1.5 KB (CSV + dark mode)
  data.js:   +1.0 KB (migration)
  index.html: +0.3 KB (update banner)
  style.css:  +0.2 KB (banner styles)
```

---

## 🔜 Co dál? (v2.2 plán)

### Plánované funkce:
- [ ] IndexedDB storage (větší kapacita)
- [ ] Advanced filtry (datum, cena, typ)
- [ ] Quick actions (FAB menu)
- [ ] Onboarding tutorial
- [ ] Performance monitoring
- [ ] PDF export s grafy

### Community requests:
- [ ] Multi-driver support
- [ ] Trip tracking (work/personal)
- [ ] Service history
- [ ] Reminder notifikace

---

## 🙏 Poděkování

Díky všem, kdo testovali v2.0.0 a poskytli feedback!

**Contributors:**
- Error reporting: 15+ uživatelů
- Feature requests: 8+ návrhů
- Testing: Beta testers skupiny

---

## 📞 Support

**Máte otázku nebo problém?**

1. Zkontrolujte logy: Nastavení → Zobrazit logy
2. Exportujte logy pro analýzu
3. Otevřete issue na GitHubu
4. Nebo nás kontaktujte

**Quick Links:**
- 📖 [Full Documentation](ERROR_HANDLING_DOCUMENTATION.md)
- 📝 [Changelog](CHANGELOG.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🐛 [Report Bug](https://github.com/yourusername/fuel-tracker/issues)

---

**Happy tracking! 🚗💨**

*FuelTracker v2.1.0 - Built with ❤️ using Vanilla JS*
