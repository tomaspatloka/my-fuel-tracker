# FuelTracker - Dokumentace ošetření chyb a logování

## Přehled

Aplikace FuelTracker nyní obsahuje komplexní systém ošetření chyb a logování, který zajišťuje stabilitu, laditelnost a lepší uživatelskou zkušenost.

## Struktura

### 1. Logger (js/logger.js)

Centralizovaný systém logování s různými úrovněmi závažnosti.

#### Úrovně logování
- **DEBUG** (0) - Detailní informace pro ladění
- **INFO** (1) - Informativní zprávy o běhu aplikace
- **WARN** (2) - Varování o potenciálních problémech
- **ERROR** (3) - Chyby, které nebrání běhu aplikace
- **FATAL** (4) - Kritické chyby, které mohou znemožnit běh aplikace

#### Hlavní funkce

```javascript
// Inicializace loggeru
Logger.init({
    logLevel: Logger.LEVELS.INFO,
    enableConsole: true
});

// Logování
Logger.debug('Category', 'Message', { data });
Logger.info('Category', 'Message', { data });
Logger.warn('Category', 'Message', { data });
Logger.error('Category', 'Message', { data });
Logger.fatal('Category', 'Message', { data });

// Správa logů
Logger.getLogs();                // Získat všechny logy
Logger.getPersistedErrors();     // Získat uložené chyby
Logger.clearLogs();              // Smazat aktuální logy
Logger.clearPersistedErrors();   // Smazat uložené chyby
Logger.exportLogs();             // Exportovat logy do JSON
```

#### Automatické ošetření
- **Global error handler** - Zachytává všechny nezachycené chyby
- **Unhandled promise rejections** - Zachytává neošetřené Promise chyby
- **Persistentní ukládání** - ERROR a FATAL logy se ukládají do localStorage
- **Rotace logů** - Uchovává posledních 100 logů v paměti a 50 chyb v localStorage

### 2. ErrorHandler (js/logger.js)

Utility pro ošetření chyb a validaci dat.

#### Funkce

```javascript
// Obalení funkce s error handlingem
const safeFunction = ErrorHandler.wrap(myFunction, 'FunctionContext');

// Validace povinných polí
const validation = ErrorHandler.validateRequired(['field1', 'field2'], data);

// Validace číselného rozsahu
const rangeValidation = ErrorHandler.validateRange(value, min, max, 'FieldName');

// Validace data
const dateValidation = ErrorHandler.validateDate(dateString, 'FieldName');
```

### 3. DomHelper (js/app.js)

Bezpečné operace s DOM s automatickým error handlingem.

#### Funkce

```javascript
// Bezpečné získání elementu
const element = DomHelper.getElementById('elementId');

// Bezpečné nastavení obsahu
DomHelper.setContent('elementId', htmlContent);

// Bezpečné získání hodnoty
const value = DomHelper.getValue('inputId');

// Bezpečné nastavení hodnoty
DomHelper.setValue('inputId', value);

// Bezpečné přidání event listeneru
DomHelper.addEventListener('elementId', 'click', handler);
```

## Implementované ošetření chyb

### DataManager (js/data.js)

#### 1. Inicializace
- Ošetření poškozených dat v localStorage
- Automatické vytvoření zálohy poškozených dat
- Validace integrity dat při načtení
- Odstranění neplatných záznamů
- Odstranění osiřelých záznamů tankování

#### 2. Ukládání dat
- Ošetření QuotaExceededError (plné úložiště)
- Automatické čištění starých záloh
- Validace dat před uložením

#### 3. Práce s tankováními
- Validace všech povinných polí
- Kontrola číselných rozsahů (litery, cena, tachometr)
- Kontrola platnosti data
- Kontrola kapacity nádrže
- Kontrola cenových limitů
- Kontrola konzistence tachometru

#### 4. Výpočet statistik
- Ošetření nedostatku dat
- Error handling při výpočtech
- Validace výsledků

### App.js

#### 1. Inicializace aplikace
- Try-catch pro celý startup proces
- Zobrazení kritické chyby uživateli při selhání
- Možnost obnovení stránky

#### 2. Navigace mezi záložkami
- Error handling pro přepínání záložek
- Automatická obnova při chybě
- Zobrazení chybové stránky s možností obnovy

#### 3. Ukládání tankování
- Detailní validace všech vstupů
- Kontrola existence vozidla
- Validace číselných hodnot
- Informativní chybové hlášky
- Automatický refresh po úspěšném uložení

#### 4. Import/Export dat
- Validace formátu importovaného souboru
- Ošetření chyb při čtení souboru
- Logování celého procesu
- Informativní zprávy pro uživatele

## Uživatelské rozhraní pro logy

### Nastavení aplikace

V sekci **Nastavení** → **Ladění a logy** jsou k dispozici:

1. **Zobrazit logy**
   - Zobrazuje všechny aktuální logy a uložené chyby
   - Barevné odlišení podle úrovně závažnosti
   - Časové razítko pro každý záznam
   - Zobrazení detailních dat chyby

2. **Exportovat logy**
   - Export všech logů do JSON souboru
   - Obsahuje aktuální logy i perzistentní chyby
   - Užitečné pro debugging a reporting

3. **Smazat logy**
   - Vyčištění všech logů a perzistentních chyb
   - Potvrzovací dialog před smazáním

## Doporučení pro debugging

### 1. Konzole prohlížeče
Všechny logy se také zobrazují v konzoli prohlížeče:
- Otevřete DevTools (F12)
- Přejděte na záložku Console
- Logy jsou barevně odlišeny podle úrovně

### 2. Exportované logy
Pro analýzu složitějších problémů:
1. Reprodukujte problém
2. Exportujte logy přes Nastavení
3. Prohlédněte JSON soubor pro detailní informace

### 3. localStorage
Persisten tní chyby jsou uloženy v:
```javascript
localStorage.getItem('fuelTrackerErrors')
```

### 4. Zálohy poškozených dat
Pokud dojde k poškození dat, automatická záloha se uloží jako:
```javascript
localStorage.getItem('fuelTrackerData_corrupted_[timestamp]')
```

## Typy chyb a jejich ošetření

### 1. Chyby uživatelského vstupu
- **Validace na straně klienta**
- **Informativní chybové hlášky**
- **Pole zůstane vyplněné pro opravu**

### 2. Chyby localStorage
- **QuotaExceededError** - Automatické čištění a pokus o opakování
- **Poškozená data** - Záloha a obnovení výchozích dat
- **Parse errors** - Logování a záloha

### 3. DOM chyby
- **Element not found** - Logování varování
- **Render errors** - Try-catch s fallback UI
- **Event handler errors** - Izolované ošetření každého handleru

### 4. Chyby výpočtů
- **Division by zero** - Kontrola před výpočtem
- **NaN values** - Validace číselných hodnot
- **Nekonzistentní data** - Čištění při validaci integrity

## Best Practices

### Pro vývojáře

1. **Vždy používejte Logger místo console.log**
   ```javascript
   // Špatně
   console.log('Saving data');

   // Správně
   Logger.info('DataManager', 'Saving data', { dataSize: data.length });
   ```

2. **Obalujte rizikové operace do try-catch**
   ```javascript
   try {
       // Riziková operace
   } catch (e) {
       Logger.error('Context', 'Operation failed', {
           error: e.message,
           stack: e.stack
       });
       showNotification('Chyba při operaci');
   }
   ```

3. **Používejte validační funkce**
   ```javascript
   const validation = ErrorHandler.validateRequired(['field'], data);
   if (!validation.valid) {
       // Ošetření
   }
   ```

4. **Používejte DomHelper pro DOM operace**
   ```javascript
   // Místo přímého přístupu
   DomHelper.setContent('elementId', content);
   ```

### Pro uživatele

1. **Pravidelně exportujte data** (Nastavení → Exportovat data)
2. **Při problémech exportujte logy** pro analýzu
3. **Nemazat e logy dokud problém není vyřešen**
4. **Pravidelně kontrolujte sekci logů** na neočekávané chyby

## Shrnutí vylepšení

✅ **Centralizované logování** - Všechny události aplikace jsou logovány
✅ **Error boundary** - Globální zachytávání chyb
✅ **Validace dat** - Komplexní validace všech vstupů
✅ **Persistentní logy** - Kritické chyby přežijí refresh
✅ **Uživatelské rozhraní** - Přehledné zobrazení logů
✅ **Export/Import** - Možnost exportu pro debugging
✅ **Automatické zálohy** - Ochrana před ztrátou dat
✅ **Informativní hlášky** - Srozumitelné chybové zprávy
✅ **DOM safety** - Bezpečné operace s DOM
✅ **Data integrity** - Automatické čištění nevalidních dat

## Závěr

Aplikace FuelTracker nyní obsahuje robustní systém ošetření chyb a logování, který:
- **Zvyšuje stabilitu** aplikace
- **Usnadňuje debugging** a řešení problémů
- **Chrání uživatelská data** před ztrátou
- **Poskytuje přehled** o běhu aplikace
- **Zlepšuje uživatelskou zkušenost** informativními hláškami
