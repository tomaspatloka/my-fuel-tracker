"use strict";

/**
 * Application Version
 */
const APP_VERSION = '2.8.0';

/**
 * Changelog - Version History
 */
const CHANGELOG = [
    {
        version: '2.8.0',
        date: '2026-09-29',
        changes: [
            {
                type: 'fix',
                title: 'Cloud synchronizace už nemaže data',
                description: 'Synchronizace data slučuje (záznam po záznamu) místo přepisování. Tankování zadané na jiném zařízení nebo offline se už neztratí. Při otevření aplikace se data nejdřív stáhnou a sloučí, teprve potom odešlou.'
            },
            {
                type: 'fix',
                title: 'Bezpečnější import a obnova',
                description: 'Před importem, obnovou z jiného zařízení i obnovou ze zálohy se aplikace zeptá a automaticky zazálohuje současná data. Sync ID ze souboru se převezme jen po potvrzení.'
            },
            {
                type: 'feature',
                title: 'Zálohy v zařízení',
                description: 'Nastavení > Data > Zálohy v zařízení: poslední 3 automatické zálohy s možností obnovy.'
            },
            {
                type: 'feature',
                title: 'Celková cena z účtenky',
                description: 'Celkovou cenu jde zadat přímo (např. se slevou), cena za litr se dopočítá. Nově i volba "Předchozí tankování nezapsáno", aby zapomenuté tankování nepokazilo spotřebu.'
            },
            {
                type: 'fix',
                title: 'Přesnější spotřeba a náklady',
                description: 'Záznamy se řadí podle tachometru (správně i víc tankování za den), všude se počítá stejným algoritmem, "Palivo celkem" už obsahuje i první tankování.'
            },
            {
                type: 'fix',
                title: 'Datum a platnost',
                description: 'Po půlnoci se předvyplní správné datum a dnešek jde uložit. Dálniční známka / STK platí celý poslední den a po koupi nové se stará už nehlásí jako prošlá.'
            },
            {
                type: 'feature',
                title: 'Upozornění na přehledu a servis podle km',
                description: 'Prošlé a brzy končící platnosti se ukazují i na Přehledu. U servisu jde zadat "Příští servis při km" a aplikace upozorní 1000 km předem.'
            },
            {
                type: 'improvement',
                title: 'Aktualizace bez ztráty rozepsaných dat',
                description: 'Nová verze se už nenačte sama uprostřed zadávání - objeví se lišta s tlačítkem Aktualizovat.'
            },
            {
                type: 'improvement',
                title: 'Drobnosti',
                description: 'Klepnutí na záznam ho otevře k úpravě, swipe se nespustí při posouvání, jde zvětšit písmo, CSV se správně otevře v českém Excelu, varování místo zákazu při větším objemu než nádrž a kontrola překlepu v tachometru.'
            }
        ]
    },
    {
        version: '2.7.2',
        date: '2026-09-21',
        changes: [
            {
                type: 'feature',
                title: 'Rozsah ceny za litr jde nastavit',
                description: 'Nastavení > Tankování má políčka pro nejnižší a nejvyšší cenu za litr. Dřív byl rozsah zadrátovaný v kódu a nešel změnit.'
            },
            {
                type: 'improvement',
                title: 'Limit ukazuje přesně to, co je nastavené',
                description: 'Skrytá tolerance ±10 Kč z verze 2.7.1 je pryč, protože rozsah si teď nastavíte sami. Původní limit 25-45 Kč/l se jednorázově rozšíří na 15-55 Kč/l.'
            }
        ]
    },
    {
        version: '2.7.1',
        date: '2026-09-21',
        changes: [
            {
                type: 'fix',
                title: 'Šlo zadat jen cenu paliva v rozsahu 25-45 Kč/l',
                description: 'Limit ceny za litr má nově toleranci ±10 Kč nad nastavený rozsah, takže projde i prémiové palivo nebo LPG. Výchozí rozsah 25-45 Kč tak reálně povolí 15-55 Kč/l.'
            }
        ]
    },
    {
        version: '2.7.0',
        date: '2026-01-31',
        changes: [
            {
                type: 'feature',
                title: 'Akumulační algoritmus výpočtu spotřeby (Fuelio style)',
                description: 'Spotřeba se počítá od plné nádrže k plné nádrži. Částečná tankování se akumulují a spotřeba se vypočte až při dalším plném tankování.'
            },
            {
                type: 'improvement',
                title: 'Přesnější výpočty spotřeby',
                description: 'Algoritmus nyní správně sčítá všechny litry mezi plnými nádržemi a dělí celkovou vzdáleností. Odpovídá standardním fuel tracking aplikacím.'
            },
            {
                type: 'fix',
                title: 'Oprava chybného vzorce spotřeby',
                description: 'V2.6.0 měla chybu - počítala natankované litry místo spotřebovaných. Nyní opraveno podle průmyslových standardů.'
            }
        ]
    },
    {
        version: '2.6.0',
        date: '2026-01-31',
        changes: [
            {
                type: 'fix',
                title: 'Vráceno zpět - obsahovalo chybný algoritmus',
                description: 'Tato verze měla chybný výpočet spotřeby a byla nahrazena verzí 2.7.0'
            }
        ]
    },
    {
        version: '2.5.0',
        date: '2026-01-31',
        changes: [
            {
                type: 'fix',
                title: 'Oprava načítání grafů',
                description: 'Chart.js je nyní hostován lokálně místo CDN, vyřešeny CSP problémy'
            },
            {
                type: 'fix',
                title: 'Oprava nekonečné smyčky',
                description: 'Přidán maximální počet pokusů o načtení grafů (10x), zobrazení chyby uživateli'
            },
            {
                type: 'improvement',
                title: 'Lepší error handling',
                description: 'Grafy zobrazí uživatelsky přívětivou chybovou hlášku při selhání'
            }
        ]
    },
    {
        version: '2.4.0',
        date: '2026-01-31',
        changes: [
            {
                type: 'feature',
                title: 'Interaktivní grafy ve statistikách',
                description: 'Přidány Chart.js grafy pro lepší vizualizaci dat (koláčové a čárové grafy)'
            },
            {
                type: 'feature',
                title: 'Statistiky cen paliva',
                description: 'Zobrazení nejlevnějšího, nejdražšího, průměrného a posledního tankování'
            },
            {
                type: 'feature',
                title: 'Systém verzování',
                description: 'Zobrazení verze aplikace v hlavičce a v nastavení'
            },
            {
                type: 'feature',
                title: 'Historie verzí',
                description: 'Přehled všech funkcí a vylepšení podle verzí (tento dialog)'
            },
            {
                type: 'improvement',
                title: 'Vylepšený export/import',
                description: 'Export obsahuje Sync ID a timestamp, automatické stahování z cloudu při importu'
            },
            {
                type: 'improvement',
                title: 'Automatická cloud synchronizace',
                description: 'Data se automaticky nahrávají do cloudu 5 sekund po změně'
            },
            {
                type: 'fix',
                title: 'Opravy grafů',
                description: 'Vyřešeny problémy s načítáním Chart.js knihovny'
            }
        ]
    },
    {
        version: '2.3.0',
        date: '2026-01-30',
        changes: [
            {
                type: 'feature',
                title: 'Vynutit aktualizaci',
                description: 'Funkce pro manuální vyčištění cache a restart aplikace'
            },
            {
                type: 'improvement',
                title: 'Opravy logiky a validace',
                description: 'Vylepšená validace dat a chybové hlášení'
            }
        ]
    },
    {
        version: '2.2.0',
        date: '2026-01-29',
        changes: [
            {
                type: 'feature',
                title: 'Editace vozidel',
                description: 'Možnost upravovat existující vozidla, přidána SPZ a rok výroby'
            },
            {
                type: 'feature',
                title: 'Spotřeba l/100km',
                description: 'Automatický výpočet a zobrazení spotřeby u každého tankování'
            }
        ]
    },
    {
        version: '2.1.0',
        date: '2026-01-28',
        changes: [
            {
                type: 'feature',
                title: 'Automatické aktualizace',
                description: 'Systém pro automatickou detekci a instalaci aktualizací'
            },
            {
                type: 'feature',
                title: 'Service Worker',
                description: 'PWA podpora pro offline režim'
            }
        ]
    },
    {
        version: '2.0.0',
        date: '2026-01-27',
        changes: [
            {
                type: 'feature',
                title: 'Cloud synchronizace',
                description: 'Synchronizace dat mezi zařízeními pomocí Cloudflare KV'
            },
            {
                type: 'feature',
                title: 'Servisní záznamy',
                description: 'Správa servisu, pojištění, STK, dálničních známek'
            },
            {
                type: 'feature',
                title: 'Dark mode',
                description: 'Tmavý režim s automatickou detekcí systémového nastavení'
            },
            {
                type: 'feature',
                title: 'Export/Import dat',
                description: 'Možnost exportu a importu dat ve formátu JSON a CSV'
            }
        ]
    },
    {
        version: '1.0.0',
        date: '2026-01-25',
        changes: [
            {
                type: 'feature',
                title: 'Základní funkce',
                description: 'Evidence tankování, výpočet spotřeby, základní statistiky'
            },
            {
                type: 'feature',
                title: 'Více vozidel',
                description: 'Možnost spravovat více vozidel současně'
            },
            {
                type: 'feature',
                title: 'LocalStorage',
                description: 'Automatické ukládání dat lokálně v prohlížeči'
            }
        ]
    }
];

// escapeHtml(), isSafeId(), DateUtil and formatNumber() live in js/utils.js

/**
 * DOM Helper - Safe DOM operations with error handling
 */
const DomHelper = {
    /**
     * Safely get element by ID
     */
    getElementById: function (id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                Logger.warn('DomHelper', 'Element not found', { id });
            }
            return element;
        } catch (e) {
            Logger.error('DomHelper', 'Failed to get element by ID', {
                id,
                error: e.message
            });
            return null;
        }
    },

    /**
     * Safely set element content
     */
    setContent: function (elementOrId, content) {
        try {
            const element = typeof elementOrId === 'string'
                ? this.getElementById(elementOrId)
                : elementOrId;

            if (!element) {
                throw new Error('Element not found');
            }

            element.innerHTML = content;
            Logger.debug('DomHelper', 'Content set successfully');
            return true;
        } catch (e) {
            Logger.error('DomHelper', 'Failed to set content', {
                error: e.message,
                stack: e.stack
            });
            return false;
        }
    },

    /**
     * Safely get value from input
     */
    getValue: function (id) {
        try {
            const element = this.getElementById(id);
            if (!element) {
                return null;
            }
            return element.value;
        } catch (e) {
            Logger.error('DomHelper', 'Failed to get value', {
                id,
                error: e.message
            });
            return null;
        }
    },

    /**
     * Safely set value to input
     */
    setValue: function (id, value) {
        try {
            const element = this.getElementById(id);
            if (!element) {
                return false;
            }
            element.value = value;
            return true;
        } catch (e) {
            Logger.error('DomHelper', 'Failed to set value', {
                id,
                error: e.message
            });
            return false;
        }
    },

    /**
     * Safely add event listener
     */
    addEventListener: function (elementOrId, event, handler) {
        try {
            const element = typeof elementOrId === 'string'
                ? this.getElementById(elementOrId)
                : elementOrId;

            if (!element) {
                throw new Error('Element not found');
            }

            element.addEventListener(event, (e) => {
                try {
                    handler(e);
                } catch (err) {
                    Logger.error('DomHelper', 'Event handler error', {
                        event,
                        error: err.message,
                        stack: err.stack
                    });
                    showNotification('Nastala chyba');
                }
            });

            return true;
        } catch (e) {
            Logger.error('DomHelper', 'Failed to add event listener', {
                event,
                error: e.message
            });
            return false;
        }
    }
};

// Currently shown tab - views refresh in place instead of jumping to the dashboard
let currentTab = 'dashboard';

const SERVICE_TYPES = {
    service: { label: 'Servis / Opravy', icon: 'build' },
    vignette: { label: 'Dálniční známky', icon: 'toll' },
    insurance: { label: 'Pojištění', icon: 'security' },
    inspection: { label: 'STK / Emise', icon: 'verified' },
    other: { label: 'Ostatní', icon: 'more_horiz' }
};

document.addEventListener('DOMContentLoaded', function () {
    try {
        // Initialize Logger first
        Logger.init({
            logLevel: Logger.LEVELS.INFO,
            enableConsole: true
        });

        Logger.info('App', 'Application starting');

        DataManager.init();
        renderApp('dashboard');

        // Cloud sync: refresh the view when merged data changed, and sync on start
        // (this also sends changes made offline last time)
        if (typeof CloudSync !== 'undefined') {
            CloudSync.onDataChanged = refreshCurrentView;
            if (CloudSync.isEnabled() && CloudSync.isOnline()) {
                CloudSync.fullSync();
            }
        }

        Logger.info('App', 'Application initialized successfully');
    } catch (e) {
        Logger.fatal('App', 'Failed to initialize application', {
            error: e.message,
            stack: e.stack
        });

        // Show critical error to user
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: sans-serif;">
                <h2 style="color: red;">Kritická chyba</h2>
                <p>Aplikace se nepodařilo spustit. Zkuste obnovit stránku.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px;">
                    Obnovit stránku
                </button>
            </div>
        `;
    }
});

function renderApp(tabName) {
    try {
        Logger.debug('App', 'Rendering app');

        updateVersionDisplay();

        // Check if we have active vehicle
        const activeVehicle = DataManager.getActiveVehicle();
        if (activeVehicle && DataManager.state.settings.activeVehicleId !== activeVehicle.id) {
            DataManager.setActiveVehicle(activeVehicle.id);
        }

        updateVehicleSelector();
        switchTab(tabName || currentTab || 'dashboard');
    } catch (e) {
        Logger.error('App', 'Failed to render app', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při načítání aplikace');
    }
}

/**
 * Re-render the current tab (after save, delete, cloud merge...)
 */
function refreshCurrentView() {
    updateVehicleSelector();
    switchTab(currentTab || 'dashboard');
}

/**
 * Update version display in header
 */
function updateVersionDisplay() {
    const versionEl = document.getElementById('appVersion');
    if (versionEl) {
        versionEl.textContent = `v${APP_VERSION}`;
    }
}

// === Navigation ===
function switchTab(tabName, event) {
    try {
        Logger.debug('Navigation', 'Switching tab', { tabName });
        currentTab = tabName;

        // Charts live only on the stats tab
        if (tabName !== 'stats') {
            destroyStatsCharts();
        }

        // UI Update
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });

        // Render Content
        const contentEl = document.getElementById('mainContent');
        const fab = document.getElementById('fabContainer');

        if (!contentEl || !fab) {
            throw new Error('Required DOM elements not found');
        }

        // Show/Hide FAB
        const fabBtn = fab.querySelector('.fab-main');
        if (tabName === 'dashboard' || tabName === 'refuel') {
            fab.style.display = 'flex';
            fabBtn.onclick = () => openRefuelModal();
            fabBtn.setAttribute('aria-label', 'Nové tankování');
        } else if (tabName === 'service') {
            fab.style.display = 'flex';
            fabBtn.onclick = () => openServiceModal();
            fabBtn.setAttribute('aria-label', 'Nový servisní záznam');
        } else {
            fab.style.display = 'none';
        }

        const activeVehicle = DataManager.getActiveVehicle();

        if (!activeVehicle && tabName !== 'garage' && tabName !== 'settings') {
            contentEl.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--md-sys-color-outline);">no_crash</span>
                <h3>Žádné vozidlo</h3>
                <p style="margin-bottom: 20px; color: var(--md-sys-color-on-surface-variant);">Pro začátek přidejte své auto do garáže.</p>
                <button class="button filled-button" onclick="switchTab('garage')">Přejít do Garáže</button>
            </div>
        `;
            fab.style.display = 'none';
            return;
        }

        switch (tabName) {
            case 'dashboard':
                renderDashboard(activeVehicle);
                break;
            case 'refuel':
                renderRefuelHistory(activeVehicle);
                break;
            case 'stats':
                renderStats(activeVehicle);
                break;
            case 'service':
                renderService(activeVehicle);
                break;
            case 'garage':
                renderGarage();
                break;
            case 'settings':
                renderSettings();
                break;
        }
    } catch (e) {
        Logger.error('Navigation', 'Failed to switch tab', {
            error: e.message,
            stack: e.stack,
            tabName
        });
        showNotification('Chyba při přepínání záložky');

        const contentEl = document.getElementById('mainContent');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px 20px;">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: var(--md-sys-color-error);">error</span>
                    <h3>Nastala chyba</h3>
                    <p style="margin-bottom: 20px; color: var(--md-sys-color-on-surface-variant);">Zkuste obnovit stránku.</p>
                    <button class="button filled-button" onclick="location.reload()">Obnovit</button>
                </div>
            `;
        }
    }
}

function switchVehicle(id) {
    if (id && DataManager.getVehicle(id)) {
        DataManager.setActiveVehicle(id);
        renderApp(); // stays on the current tab
    }
}

function updateVehicleSelector() {
    const selector = document.getElementById('vehicleSelector');
    if (!selector) return;
    selector.innerHTML = '';
    const vehicles = DataManager.getVehicles();
    const active = DataManager.getActiveVehicle();

    if (vehicles.length === 0) {
        const opt = document.createElement('option');
        opt.text = "Žádné auto";
        opt.value = '';
        selector.add(opt);
        return;
    }

    vehicles.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.text = v.name;
        if (active && v.id === active.id) opt.selected = true;
        selector.add(opt);
    });
}

// === Main App Logic ===

function pluralDays(n) {
    if (n === 1) return '1 den';
    if (n >= 2 && n <= 4) return `${n} dny`;
    return `${n} dní`;
}

/**
 * Alerts: expired / soon expiring validity and services due by km.
 * Shown on the dashboard and on the service tab.
 */
function renderAlertsHtml(vehicle, linkToService = false) {
    const expired = DataManager.getExpiredServices(vehicle.id);
    const expiring = DataManager.getExpiringServices(vehicle.id, 30);
    const dueKm = DataManager.getServicesDueByKm(vehicle.id, 1000);

    if (expired.length === 0 && expiring.length === 0 && dueKm.length === 0) return '';

    const today = DateUtil.today();
    const typeLabel = s => (SERVICE_TYPES[s.type] || SERVICE_TYPES.other).label;

    const items = [];
    expired.forEach(s => {
        items.push(`
            <div class="log-item" style="border-left: 3px solid var(--md-sys-color-error); padding-left: 12px; margin-bottom: 8px;">
                <div>
                    <div class="log-main" style="color: var(--md-sys-color-error);">VYPRŠELO: ${escapeHtml(s.description || typeLabel(s))}</div>
                    <div class="log-sub">${escapeHtml(typeLabel(s))} • platnost skončila ${escapeHtml(DateUtil.format(s.validUntil))}</div>
                </div>
            </div>`);
    });
    expiring.forEach(s => {
        const daysLeft = DateUtil.daysBetween(today, s.validUntil);
        const when = daysLeft === 0 ? 'dnes platí naposledy' : `zbývá ${pluralDays(daysLeft)}`;
        items.push(`
            <div class="log-item" style="border-left: 3px solid #ff9800; padding-left: 12px; margin-bottom: 8px;">
                <div>
                    <div class="log-main" style="color: #e65100;">Brzy vyprší: ${escapeHtml(s.description || typeLabel(s))}</div>
                    <div class="log-sub">${escapeHtml(when)} (do ${escapeHtml(DateUtil.format(s.validUntil))})</div>
                </div>
            </div>`);
    });
    dueKm.forEach(({ service, remainingKm }) => {
        const overdue = remainingKm <= 0;
        const text = overdue
            ? `po termínu o ${formatNumber(-remainingKm)} km`
            : `za ${formatNumber(remainingKm)} km`;
        items.push(`
            <div class="log-item" style="border-left: 3px solid ${overdue ? 'var(--md-sys-color-error)' : '#ff9800'}; padding-left: 12px; margin-bottom: 8px;">
                <div>
                    <div class="log-main" style="color: ${overdue ? 'var(--md-sys-color-error)' : '#e65100'};">Servis ${escapeHtml(text)}: ${escapeHtml(service.description || typeLabel(service))}</div>
                    <div class="log-sub">naplánováno při ${escapeHtml(formatNumber(service.nextOdometer))} km</div>
                </div>
            </div>`);
    });

    return `
        <div class="card" style="margin-bottom: 16px; border-left: 4px solid var(--md-sys-color-error); ${linkToService ? 'cursor: pointer;' : ''}"
            ${linkToService ? `onclick="switchTab('service')"` : ''}>
            <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-error); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">warning</span>
                Upozornění
            </h3>
            ${items.join('')}
        </div>
    `;
}

function renderDashboard(vehicle) {
    const stats = DataManager.calculateStats(vehicle.id);
    const logs = DataManager.getRefuels(vehicle.id);
    const last3 = logs.slice(0, 3);
    const currency = DataManager.state.settings.currency;
    const safeCurrency = escapeHtml(currency);
    const consumptionMap = DataManager.calculateConsumptionForRefuels(vehicle.id);

    const avgCons = stats && stats.avgCons !== null ? formatNumber(stats.avgCons, 1) : '--';
    const costPerKm = stats && stats.costPerKm !== null ? formatNumber(stats.costPerKm, 2) : '--';

    const content = `
        ${renderAlertsHtml(vehicle, true)}
        <div class="card card-elevated">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">analytics</span>
                    Přehled - ${escapeHtml(vehicle.name)}
                </h2>
                ${vehicle.engine ? `<span style="font-size: 0.8rem; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 4px 8px; border-radius: 8px;">
                    ${escapeHtml(vehicle.engine)}
                </span>` : ''}
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(avgCons)}</div>
                    <div class="stat-label">Ø Spotřeba (l/100km)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(costPerKm)}</div>
                    <div class="stat-label">Palivo na km (${safeCurrency})</div>
                </div>
            </div>

            <!-- Graph Container -->
            <div style="height: 200px; margin-bottom: 20px;">
                ${renderLineChart(stats ? stats.consumptions : [])}
            </div>

            <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Poslední tankování</h3>
            ${last3.length > 0 ? last3.map(log => createSwipeableLogItem(log, currency, consumptionMap[log.id])).join('') : '<p style="color: var(--md-sys-color-outline);">Zatím žádné záznamy.</p>'}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
    attachRefuelSwipeListeners();
}

function renderRefuelHistory(vehicle) {
    const logs = DataManager.getRefuels(vehicle.id);
    const currency = DataManager.state.settings.currency;
    const consumptionMap = DataManager.calculateConsumptionForRefuels(vehicle.id);

    let listContent = '';
    if (logs.length === 0) {
        listContent = `<p style="text-align: center; color: var(--md-sys-color-outline); margin-top: 40px;">Zatím žádné tankování.</p>`;
    } else {
        listContent = logs.map(log => createSwipeableLogItem(log, currency, consumptionMap[log.id])).join('');
    }

    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">history</span>
                    Historie tankování
                </h2>
            </div>
            ${logs.length > 0 ? `<p style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px;">Klepnutím upravíte, tažením doleva smažete.</p>` : ''}
            <div class="history-list">
                ${listContent}
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
    attachRefuelSwipeListeners();
}

// Helper to create HTML for swipe item
function createSwipeableLogItem(log, currency, consumption = null) {
    const safeId = escapeHtml(log.id);
    const safeCurrency = escapeHtml(currency);
    const consumptionDisplay = (consumption !== null && consumption !== undefined)
        ? `${escapeHtml(formatNumber(consumption, 1))} l/100km` : '--';
    const flags = [];
    if (!log.isFullTank) flags.push('částečné');
    if (log.missedPrevious) flags.push('předchozí nezapsáno');

    return `
    <div class="swipe-container refuel-item" id="log-${safeId}" data-id="${safeId}">
        <div class="swipe-actions-left">
            <span class="material-symbols-outlined">edit</span>
        </div>
        <div class="swipe-actions-right">
            <span class="material-symbols-outlined">delete</span>
        </div>
        <div class="swipe-content log-item">
            <div style="flex: 1;">
                <div class="log-main">${escapeHtml(DateUtil.format(log.date))}${flags.length ? ` <span style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">(${escapeHtml(flags.join(', '))})</span>` : ''}</div>
                <div class="log-sub">${escapeHtml(formatNumber(log.odometer))} km • ${escapeHtml(formatNumber(log.pricePerLiter, 2))} ${safeCurrency}/l</div>
            </div>
            <div style="text-align: right;">
                <div class="log-value">${escapeHtml(formatNumber(log.liters, 2))} l</div>
                <div class="log-sub">${escapeHtml(formatNumber(log.totalPrice, 2))} ${safeCurrency}</div>
                <div class="log-consumption" style="font-size: 0.75rem; color: var(--md-sys-color-primary); font-weight: 500; margin-top: 2px;">${consumptionDisplay}</div>
            </div>
        </div>
    </div>
    `;
}

// === Swipe Logic (shared by refuel and service lists) ===
// Tap = edit, swipe right = edit, swipe left = delete (with confirmation).
// The swipe only starts after a clearly horizontal move, so scrolling the
// list up and down can no longer trigger edit/delete by accident.
const swipeState = {
    active: null,     // .swipe-content element being dragged
    id: null,
    onEdit: null,
    onDelete: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    locked: null,     // 'h' (swipe) or 'v' (scroll)
    moved: false,
    suppressClickUntil: 0
};

let swipeHandlersInitialized = false;

function initGlobalSwipeHandlers() {
    if (swipeHandlersInitialized) return;
    swipeHandlersInitialized = true;

    window.addEventListener('mousemove', (e) => onSwipeMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => onSwipeEnd());
}

function onSwipeStart(content, id, onEdit, onDelete, x, y) {
    swipeState.active = content;
    swipeState.id = id;
    swipeState.onEdit = onEdit;
    swipeState.onDelete = onDelete;
    swipeState.startX = x;
    swipeState.startY = y;
    swipeState.currentX = 0;
    swipeState.locked = null;
    swipeState.moved = false;
    content.style.transition = 'none';
}

function onSwipeMove(x, y) {
    const s = swipeState;
    if (!s.active) return;
    const dx = x - s.startX;
    const dy = y - s.startY;

    if (!s.locked) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        s.locked = Math.abs(dx) > Math.abs(dy) * 1.5 ? 'h' : 'v';
        if (s.locked === 'v') {
            // User is scrolling - cancel the swipe
            s.active.style.transform = 'translateX(0px)';
            s.active = null;
            s.suppressClickUntil = Date.now() + 400;
            return;
        }
    }

    s.moved = true;
    s.currentX = Math.max(-100, Math.min(100, dx));
    s.active.style.transform = `translateX(${s.currentX}px)`;
}

function onSwipeEnd() {
    const s = swipeState;
    if (!s.active) return;
    const el = s.active;
    const distance = s.currentX;
    const { id, onEdit, onDelete } = s;

    el.style.transition = 'transform 0.2s ease-out';
    el.style.transform = 'translateX(0px)';
    if (s.moved) s.suppressClickUntil = Date.now() + 400;
    s.active = null;

    if (distance > 50) {
        onEdit(id);
    } else if (distance < -50) {
        onDelete(id);
    }
}

function attachSwipeListeners(selector, onEdit, onDelete) {
    initGlobalSwipeHandlers();

    document.querySelectorAll(`${selector}:not([data-swipe-initialized])`).forEach(item => {
        item.setAttribute('data-swipe-initialized', 'true');
        const content = item.querySelector('.swipe-content');
        const id = item.dataset.id;
        if (!content) return;

        content.addEventListener('touchstart', (e) => {
            onSwipeStart(content, id, onEdit, onDelete, e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        content.addEventListener('touchmove', (e) => {
            onSwipeMove(e.touches[0].clientX, e.touches[0].clientY);
            if (swipeState.locked === 'h' && swipeState.active && e.cancelable) {
                e.preventDefault(); // don't scroll the page while swiping
            }
        }, { passive: false });

        content.addEventListener('touchend', () => onSwipeEnd());
        content.addEventListener('touchcancel', () => {
            if (swipeState.active === content) {
                content.style.transform = 'translateX(0px)';
                swipeState.active = null;
            }
        });

        content.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            onSwipeStart(content, id, onEdit, onDelete, e.clientX, e.clientY);
        });

        // Tap / click = edit
        content.addEventListener('click', () => {
            if (Date.now() < swipeState.suppressClickUntil) return;
            onEdit(id);
        });
    });
}

function attachRefuelSwipeListeners() {
    attachSwipeListeners('.refuel-item', openRefuelModal, deleteRefuel);
}

// Kept for compatibility with older code paths
function handleSwipeEnd(element, distance, id) {
    element.style.transform = 'translateX(0px)';
    if (distance > 50) openRefuelModal(id);
    else if (distance < -50) deleteRefuel(id);
}

// === Modal Logic ===

// true = the total price was typed by the user (from the receipt) and is the source of truth
let refuelTotalManual = false;

/** Parse a number typed with a decimal comma or dot ("36,90" or "36.90") */
function parseNum(value) {
    if (value === null || value === undefined) return NaN;
    const str = String(value).trim().replace(/\s/g, '').replace(',', '.');
    if (str === '') return NaN;
    return Number(str);
}

function roundTo(value, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
}

function openRefuelModal(editId = null) {
    const activeVehicle = DataManager.getActiveVehicle();
    if (!activeVehicle) {
        showNotification('Vyberte nejprve vozidlo!');
        return;
    }

    const modalTitle = document.getElementById('refuelModalTitle');
    const hint = document.getElementById('refuelOdoHint');

    document.getElementById('refuelVehicleId').value = activeVehicle.id;

    if (editId) {
        // Edit Mode
        const log = DataManager.getRefuel(editId);
        if (!log) return;

        modalTitle.textContent = 'Upravit tankování';
        document.getElementById('refuelVehicleId').value = log.vehicleId;
        document.getElementById('refuelId').value = log.id;
        document.getElementById('refuelDate').value = log.date;
        document.getElementById('refuelOdo').value = log.odometer;
        document.getElementById('refuelLiters').value = log.liters;
        document.getElementById('refuelPrice').value = log.pricePerLiter;
        document.getElementById('refuelTotal').value = log.totalPrice;
        document.getElementById('refuelFull').checked = !!log.isFullTank;
        document.getElementById('refuelMissed').checked = !!log.missedPrevious;
        document.getElementById('refuelNote').value = log.notes || '';
        hint.textContent = '';
        // A total that differs from liters x price was typed from a receipt
        refuelTotalManual = Math.abs(log.totalPrice - log.liters * log.pricePerLiter) > 0.05;
    } else {
        // Add Mode
        modalTitle.textContent = 'Nové tankování';
        document.getElementById('refuelId').value = '';
        document.getElementById('refuelDate').value = DateUtil.today();

        const logs = DataManager.getRefuels(activeVehicle.id);
        const last = logs.length > 0 ? logs[0] : null;
        document.getElementById('refuelOdo').value = '';
        document.getElementById('refuelOdo').placeholder = last ? last.odometer : '';
        hint.textContent = last
            ? `Poslední stav: ${formatNumber(last.odometer)} km (${DateUtil.format(last.date)})`
            : '';

        document.getElementById('refuelLiters').value = '';
        document.getElementById('refuelPrice').value = '';
        document.getElementById('refuelTotal').value = '';
        document.getElementById('refuelFull').checked = true;
        document.getElementById('refuelMissed').checked = false;
        document.getElementById('refuelNote').value = '';
        refuelTotalManual = false;
    }

    document.getElementById('refuelModal').classList.add('active');
}

/** Liters changed: keep the typed total (recompute price) or recompute total */
function onRefuelLitersInput() {
    const liters = parseNum(document.getElementById('refuelLiters').value);
    const price = parseNum(document.getElementById('refuelPrice').value);
    const total = parseNum(document.getElementById('refuelTotal').value);

    if (refuelTotalManual && total > 0 && liters > 0) {
        document.getElementById('refuelPrice').value = roundTo(total / liters, 2);
    } else if (liters > 0 && price > 0) {
        document.getElementById('refuelTotal').value = roundTo(liters * price, 2);
    } else if (!refuelTotalManual) {
        document.getElementById('refuelTotal').value = '';
    }
}

/** Price per liter changed: total = liters x price */
function onRefuelPriceInput() {
    refuelTotalManual = false;
    const liters = parseNum(document.getElementById('refuelLiters').value);
    const price = parseNum(document.getElementById('refuelPrice').value);
    document.getElementById('refuelTotal').value = (liters > 0 && price > 0) ? roundTo(liters * price, 2) : '';
}

/** Total typed from the receipt: price per liter = total / liters */
function onRefuelTotalInput() {
    const totalStr = document.getElementById('refuelTotal').value;
    refuelTotalManual = String(totalStr).trim() !== '';
    const liters = parseNum(document.getElementById('refuelLiters').value);
    const total = parseNum(totalStr);
    if (total > 0 && liters > 0) {
        document.getElementById('refuelPrice').value = roundTo(total / liters, 2);
    }
}

// Old name used by older markup
function calculateTotal() {
    onRefuelLitersInput();
}

function saveRefuelFromModal() {
    try {
        Logger.debug('Refuel', 'Saving refuel from modal');

        const id = document.getElementById('refuelId').value;
        const vehicleId = document.getElementById('refuelVehicleId').value;
        const date = document.getElementById('refuelDate').value;
        const odoStr = String(document.getElementById('refuelOdo').value).replace(/\s/g, '');
        const isFull = document.getElementById('refuelFull').checked;
        const missedPrevious = document.getElementById('refuelMissed').checked;
        const note = document.getElementById('refuelNote').value.trim();
        const currency = DataManager.state.settings.currency;

        const odo = parseInt(odoStr, 10);
        const liters = parseNum(document.getElementById('refuelLiters').value);
        let price = parseNum(document.getElementById('refuelPrice').value);
        let total = parseNum(document.getElementById('refuelTotal').value);

        // Fill in the missing value
        if (!(total > 0) && liters > 0 && price > 0) {
            total = roundTo(liters * price, 2);
        }
        if (!(price > 0) && liters > 0 && total > 0) {
            price = roundTo(total / liters, 2);
        }

        if (!odoStr || isNaN(odo) || odo <= 0) {
            showNotification("Zadejte platný stav tachometru.");
            return;
        }
        if (!(liters > 0)) {
            showNotification("Zadejte platné množství paliva.");
            return;
        }
        if (!(price > 0)) {
            showNotification("Zadejte cenu za litr nebo celkovou cenu.");
            return;
        }
        if (!(total > 0)) {
            showNotification("Celková cena není platná.");
            return;
        }
        if (!date) {
            showNotification("Zadejte datum.");
            return;
        }
        if (date > DateUtil.today()) {
            showNotification("Datum nemůže být v budoucnosti.");
            return;
        }

        const vehicle = DataManager.getVehicle(vehicleId);
        if (!vehicle) {
            showNotification("Vozidlo nenalezeno!");
            Logger.error('Refuel', 'Vehicle not found', { vehicleId });
            return;
        }

        // 1. Tank size - real tanks take a bit more than the nominal volume,
        //    so only a clear typo (> 1.5x) is blocked, otherwise ask.
        if (vehicle.tankSize) {
            if (liters > vehicle.tankSize * 1.5) {
                showNotification(`${formatNumber(liters, 2)} l je víc než 1,5× objem nádrže (${vehicle.tankSize} l). Zkontrolujte litry.`);
                return;
            }
            if (liters > vehicle.tankSize &&
                !confirm(`Natankováno ${formatNumber(liters, 2)} l je víc než objem nádrže (${vehicle.tankSize} l).\n\nTo se může stát (hrdlo, rezerva). Uložit?`)) {
                return;
            }
        }

        // 2. Price limit (set in Settings > Tankování)
        const minPrice = DataManager.state.settings.minPrice || 0;
        const maxPrice = DataManager.state.settings.maxPrice || 1000;
        if (price < minPrice || price > maxPrice) {
            showNotification(`Cena ${formatNumber(price, 2)} ${currency}/l je mimo limit (${minPrice}-${maxPrice} ${currency}/l). Limit změníte v Nastavení.`);
            return;
        }

        // 3. Odometer must fit the date order (works for old forgotten refuels too)
        const others = DataManager.getRefuels(vehicleId).filter(r => r.id !== id);

        const duplicate = others.find(r => r.odometer === odo);
        if (duplicate) {
            showNotification(`Tankování se stavem ${formatNumber(odo)} km už existuje (${DateUtil.format(duplicate.date)}).`);
            return;
        }

        const olderHigher = others.filter(r => r.date < date && r.odometer > odo)
            .sort((a, b) => b.odometer - a.odometer)[0];
        if (olderHigher) {
            showNotification(`Tachometr musí být vyšší než ${formatNumber(olderHigher.odometer)} km (tankování z ${DateUtil.format(olderHigher.date)}).`);
            return;
        }

        const newerLower = others.filter(r => r.date > date && r.odometer < odo)
            .sort((a, b) => a.odometer - b.odometer)[0];
        if (newerLower) {
            showNotification(`Tachometr musí být nižší než ${formatNumber(newerLower.odometer)} km (tankování z ${DateUtil.format(newerLower.date)}).`);
            return;
        }

        // 4. Typo check - unusually long distance since the previous refuel
        const previous = others.filter(r => r.odometer < odo).sort((a, b) => b.odometer - a.odometer)[0];
        if (previous && odo - previous.odometer > 2000 && !missedPrevious &&
            !confirm(`Od předchozího tankování (${formatNumber(previous.odometer)} km) je to ${formatNumber(odo - previous.odometer)} km.\n\nJe stav tachometru ${formatNumber(odo)} km správně?\n(Pokud jste nějaké tankování nezapsali, zaškrtněte "Předchozí tankování nezapsáno".)`)) {
            return;
        }

        const data = {
            id: id || null,
            vehicleId,
            date,
            odometer: odo,
            liters: roundTo(liters, 2),
            pricePerLiter: roundTo(price, 3),
            totalPrice: roundTo(total, 2),
            isFullTank: isFull,
            missedPrevious,
            notes: note
        };

        let success = false;
        if (id) {
            success = DataManager.updateRefuel(data);
            if (success) showNotification('Záznam upraven');
        } else {
            const result = DataManager.addRefuel(data);
            success = result !== null;
            if (success) showNotification('Záznam uložen');
        }

        if (!success) {
            showNotification('Chyba při ukládání záznamu');
            return;
        }

        closeModal('refuelModal');
        refreshCurrentView();
    } catch (e) {
        Logger.error('Refuel', 'Failed to save refuel from modal', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při ukládání tankování');
    }
}

function deleteRefuel(id) {
    try {
        const log = DataManager.getRefuel(id);
        const label = log ? ` z ${DateUtil.format(log.date)} (${formatNumber(log.liters, 2)} l)` : '';
        if (confirm(`Opravdu smazat tankování${label}?`)) {
            const success = DataManager.deleteRefuel(id);
            if (success) {
                showNotification("Záznam smazán");
                refreshCurrentView(); // stays on the tab the user is on
            } else {
                showNotification("Chyba při mazání záznamu");
            }
        }
    } catch (e) {
        Logger.error('Refuel', 'Failed to delete refuel', {
            error: e.message,
            refuelId: id
        });
        showNotification('Chyba při mazání záznamu');
    }
}


function renderStats(vehicle) {
    const stats = DataManager.calculateStats(vehicle.id);
    const serviceCosts = DataManager.calculateServiceCosts(vehicle.id);
    const refuels = DataManager.getRefuels(vehicle.id);
    const currency = DataManager.state.settings.currency;
    const safeCurrency = escapeHtml(currency);

    // Total costs (fuel incl. the first refuel + service)
    const fuelCost = stats ? stats.totalSpent : 0;
    const totalCost = fuelCost + serviceCosts.total;
    const distanceDriven = stats ? stats.distanceDriven : 0;
    const totalCostPerKm = distanceDriven > 0 ? totalCost / distanceDriven : null;

    // Calculate fuel price statistics
    const fuelPriceStats = calculateFuelPriceStats(refuels);

    const content = `
        <div class="card" style="margin-bottom: 16px;">
            <h2 class="card-title" style="margin-bottom: 20px;">
                <span class="material-symbols-outlined">equalizer</span>
                Podrobné statistiky
            </h2>

            ${stats && stats.hasConsumption ? `
            <h3 style="font-size: 1rem; margin: 16px 0 12px; color: var(--md-sys-color-primary);">Spotřeba paliva</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(stats.avgCons, 1))}</div>
                    <div class="stat-label">Průměr (l/100km)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(stats.costPerKm, 2))}</div>
                    <div class="stat-label">Palivo na km (${safeCurrency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--md-sys-color-success);">${escapeHtml(formatNumber(stats.minCons, 1))}</div>
                    <div class="stat-label">Nejlepší (l/100km)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--md-sys-color-error);">${escapeHtml(formatNumber(stats.maxCons, 1))}</div>
                    <div class="stat-label">Nejhorší (l/100km)</div>
                </div>
            </div>

            <h3 style="font-size: 1rem; margin: 16px 0 12px; color: var(--md-sys-color-primary);">Sezónní spotřeba</h3>
            ${renderSeasonStat('Jaro', stats.seasonal.spring, currency)}
            ${renderSeasonStat('Léto', stats.seasonal.summer, currency)}
            ${renderSeasonStat('Podzim', stats.seasonal.autumn, currency)}
            ${renderSeasonStat('Zima', stats.seasonal.winter, currency)}
            ` : '<p style="color: var(--md-sys-color-outline);">Nedostatek dat pro statistiku spotřeby. Spotřeba se počítá mezi dvěma plnými nádržemi.</p>'}
        </div>

        <!-- Fuel Price Statistics -->
        ${fuelPriceStats.hasData ? `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">trending_up</span>
                Ceny paliva
            </h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--md-sys-color-success);">${escapeHtml(formatNumber(fuelPriceStats.cheapest, 2))}</div>
                    <div class="stat-label">Nejlevnější (${safeCurrency}/l)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--md-sys-color-error);">${escapeHtml(formatNumber(fuelPriceStats.mostExpensive, 2))}</div>
                    <div class="stat-label">Nejdražší (${safeCurrency}/l)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(fuelPriceStats.average, 2))}</div>
                    <div class="stat-label">Průměr (${safeCurrency}/l)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(fuelPriceStats.last, 2))}</div>
                    <div class="stat-label">Poslední (${safeCurrency}/l)</div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Total Costs -->
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">payments</span>
                Celkové náklady
            </h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(totalCost))}</div>
                    <div class="stat-label">Celkem (${safeCurrency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(fuelCost))}</div>
                    <div class="stat-label">Palivo (${safeCurrency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(serviceCosts.total))}</div>
                    <div class="stat-label">Servis (${safeCurrency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalCostPerKm !== null ? escapeHtml(formatNumber(totalCostPerKm, 2)) : '--'}</div>
                    <div class="stat-label">Celkem na km (${safeCurrency})</div>
                </div>
            </div>
            <p style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 8px;">
                Najeto ${escapeHtml(formatNumber(distanceDriven))} km (od prvního tankování) • ${serviceCosts.count} servisních záznamů
            </p>
        </div>

        <!-- Chart: Costs Breakdown (Pie) -->
        ${(fuelCost > 0 || serviceCosts.total > 0) ? `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">pie_chart</span>
                Rozdělení nákladů
            </h3>
            <div style="position: relative; height: 300px; max-width: 400px; margin: 0 auto;">
                <canvas id="costsPieChart"></canvas>
            </div>
        </div>
        ` : ''}

        <!-- Chart: Fuel Price Over Time -->
        ${refuels.length >= 2 ? `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">show_chart</span>
                Vývoj ceny paliva
            </h3>
            <div style="position: relative; height: 300px;">
                <canvas id="fuelPriceChart"></canvas>
            </div>
        </div>
        ` : ''}

        <!-- Chart: Consumption Over Time -->
        ${stats && stats.consumptions.length >= 2 ? `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">trending_down</span>
                Vývoj spotřeby
            </h3>
            <div style="position: relative; height: 300px;">
                <canvas id="consumptionChart"></canvas>
            </div>
        </div>
        ` : ''}

        <!-- Service Costs Breakdown -->
        ${serviceCosts.total > 0 ? `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">build</span>
                Servisní náklady
            </h3>
            <div style="position: relative; height: 300px; max-width: 400px; margin: 0 auto;">
                <canvas id="serviceCostsChart"></canvas>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--md-sys-color-outline-variant);">
                <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant);">Rozpis nákladů:</h4>
                ${serviceCosts.byType.service > 0 ? `<div class="log-item"><span>Servis / Opravy</span><span>${serviceCosts.byType.service.toLocaleString('cs-CZ')} ${safeCurrency}</span></div>` : ''}
                ${serviceCosts.byType.vignette > 0 ? `<div class="log-item"><span>Dálniční známky</span><span>${serviceCosts.byType.vignette.toLocaleString('cs-CZ')} ${safeCurrency}</span></div>` : ''}
                ${serviceCosts.byType.insurance > 0 ? `<div class="log-item"><span>Pojištění</span><span>${serviceCosts.byType.insurance.toLocaleString('cs-CZ')} ${safeCurrency}</span></div>` : ''}
                ${serviceCosts.byType.inspection > 0 ? `<div class="log-item"><span>STK / Emise</span><span>${serviceCosts.byType.inspection.toLocaleString('cs-CZ')} ${safeCurrency}</span></div>` : ''}
                ${serviceCosts.byType.other > 0 ? `<div class="log-item"><span>Ostatní</span><span>${serviceCosts.byType.other.toLocaleString('cs-CZ')} ${safeCurrency}</span></div>` : ''}
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('mainContent').innerHTML = content;

    // Initialize charts after DOM is ready
    setTimeout(() => {
        initStatsCharts(vehicle, stats, serviceCosts, refuels, currency);
    }, 100);
}

function renderSeasonStat(name, data, currency) {
    if (data.dist === 0) return '';
    const cons = (data.liters / data.dist * 100).toFixed(1);
    const cost = (data.cost / data.dist).toFixed(2);
    const safeCurrency = escapeHtml(currency);
    return `
        <div class="log-item">
            <div class="log-main">${escapeHtml(name)}</div>
            <div style="text-align: right;">
                <div class="log-value">${escapeHtml(cons)} l/100km</div>
                <div class="log-sub">${escapeHtml(cost)} ${safeCurrency}/km</div>
            </div>
        </div>
    `;
}

function renderGarage() {
    const vehicles = DataManager.getVehicles();
    const activeId = DataManager.state.settings.activeVehicleId;

    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Moje Auta</h2>
                <button class="button filled-button" onclick="openCarModal()">
                    <span class="material-symbols-outlined">add</span> Nové
                </button>
            </div>

            ${vehicles.map(v => {
        const safeId = escapeHtml(v.id);
        const detailParts = [];
        if (v.manufacturer) detailParts.push(escapeHtml(v.manufacturer));
        if (v.type) detailParts.push(escapeHtml(v.type));
        if (v.engine) detailParts.push(escapeHtml(v.engine));

        const extraParts = [];
        if (v.licensePlate) extraParts.push(escapeHtml(v.licensePlate));
        if (v.year) extraParts.push(escapeHtml(v.year));

        return `
                <div class="car-item ${v.id === activeId ? 'active-car' : ''}" onclick="switchVehicle('${safeId}')">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
                            ${escapeHtml(v.name)}
                            ${v.id === activeId ? '<span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-primary);">check_circle</span>' : ''}
                        </div>
                        <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">
                            ${detailParts.join(' ') || 'Bez detailů'}
                        </div>
                        ${extraParts.length > 0 ? `<div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-top: 2px;">${extraParts.join(' • ')}</div>` : ''}
                    </div>
                    <div style="display: flex; gap: 4px;">
                        <button class="button text-button" onclick="event.stopPropagation(); openCarModal('${safeId}')" title="Upravit">
                            <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary);">edit</span>
                        </button>
                        <button class="button text-button" onclick="event.stopPropagation(); deleteCar('${safeId}')" title="Smazat">
                            <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
                        </button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

// === Service Tab ===
function renderService(vehicle) {
    const services = DataManager.getServices(vehicle.id);
    const costs = DataManager.calculateServiceCosts(vehicle.id);
    const currency = DataManager.state.settings.currency;
    const safeCurrency = escapeHtml(currency);

    // Group services by type for display
    const groups = {};
    Object.keys(SERVICE_TYPES).forEach(type => { groups[type] = []; });
    services.forEach(s => {
        (groups[s.type] || groups.other).push(s);
    });

    const costLine = (label, value) => value > 0
        ? `<div>${label}: ${escapeHtml(formatNumber(value, 0))} ${safeCurrency}</div>` : '';

    // Costs summary
    const costsHtml = `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">payments</span>
                Celkové náklady na servis
            </h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(formatNumber(costs.total, 0))}</div>
                    <div class="stat-label">Celkem (${safeCurrency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(costs.count)}</div>
                    <div class="stat-label">Záznamů</div>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">
                ${costLine('Servis/Opravy', costs.byType.service)}
                ${costLine('Dálniční známky', costs.byType.vignette)}
                ${costLine('Pojištění', costs.byType.insurance)}
                ${costLine('STK/Emise', costs.byType.inspection)}
                ${costLine('Ostatní', costs.byType.other)}
            </div>
        </div>
    `;

    // Services list
    let servicesListHtml = '';
    Object.keys(SERVICE_TYPES).forEach(type => {
        const items = groups[type];
        if (items.length > 0) {
            servicesListHtml += `
                <div class="card" style="margin-bottom: 16px;">
                    <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-outlined">${SERVICE_TYPES[type].icon}</span>
                        ${SERVICE_TYPES[type].label}
                    </h3>
                    ${items.map(s => createServiceItem(s, currency)).join('')}
                </div>
            `;
        }
    });

    if (services.length === 0) {
        servicesListHtml = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--md-sys-color-outline);">build</span>
                <h3>Žádné servisní záznamy</h3>
                <p style="color: var(--md-sys-color-on-surface-variant);">Přidejte první záznam kliknutím na +</p>
            </div>
        `;
    }

    const content = `
        <div class="card" style="margin-bottom: 16px;">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">build</span>
                    Servis - ${escapeHtml(vehicle.name)}
                </h2>
            </div>
        </div>
        ${renderAlertsHtml(vehicle, false)}
        ${costsHtml}
        ${servicesListHtml}
    `;

    document.getElementById('mainContent').innerHTML = content;
    attachServiceSwipeListeners();
}

function createServiceItem(service, currency) {
    const hasValidity = !!service.validUntil;
    const isExpired = DataManager.isServiceExpired(service);
    const safeId = escapeHtml(service.id);
    const safeCurrency = escapeHtml(currency);

    return `
        <div class="swipe-container service-item" id="service-${safeId}" data-id="${safeId}">
            <div class="swipe-actions-left">
                <span class="material-symbols-outlined">edit</span>
            </div>
            <div class="swipe-actions-right">
                <span class="material-symbols-outlined">delete</span>
            </div>
            <div class="swipe-content log-item">
                <div style="flex: 1;">
                    <div class="log-main" ${isExpired ? 'style="color: var(--md-sys-color-error);"' : ''}>${escapeHtml(service.description)}</div>
                    <div class="log-sub">
                        ${escapeHtml(DateUtil.format(service.date))}
                        ${service.odometer ? ` • ${escapeHtml(formatNumber(service.odometer))} km` : ''}
                        ${hasValidity ? ` • Platí do: ${escapeHtml(DateUtil.format(service.validUntil))}` : ''}
                        ${service.nextOdometer ? ` • Příště při ${escapeHtml(formatNumber(service.nextOdometer))} km` : ''}
                    </div>
                    ${service.note ? `<div class="log-sub" style="font-style: italic;">${escapeHtml(service.note)}</div>` : ''}
                </div>
                <div>
                    <div class="log-value">${escapeHtml(formatNumber(service.cost || 0, 0))} ${safeCurrency}</div>
                </div>
            </div>
        </div>
    `;
}

function attachServiceSwipeListeners() {
    attachSwipeListeners('.service-item', openServiceModal, deleteServiceRecord);
}

function openServiceModal(editId = null) {
    const activeVehicle = DataManager.getActiveVehicle();
    if (!activeVehicle) {
        showNotification('Vyberte nejprve vozidlo!');
        return;
    }

    const modalTitle = document.getElementById('serviceModalTitle');
    document.getElementById('serviceVehicleId').value = activeVehicle.id;
    document.getElementById('serviceCostLabel').textContent = `Cena (${DataManager.state.settings.currency})`;

    if (editId) {
        const service = DataManager.getService(editId);
        if (!service) return;

        modalTitle.textContent = 'Upravit záznam';
        document.getElementById('serviceVehicleId').value = service.vehicleId;
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceType').value = service.type || 'service';
        document.getElementById('serviceDate').value = service.date;
        document.getElementById('serviceValidUntil').value = service.validUntil || '';
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceOdometer').value = service.odometer || '';
        document.getElementById('serviceNextOdometer').value = service.nextOdometer || '';
        document.getElementById('serviceCost').value = service.cost || '';
        document.getElementById('serviceNote').value = service.note || '';
    } else {
        modalTitle.textContent = 'Nový servisní záznam';
        document.getElementById('serviceId').value = '';
        document.getElementById('serviceType').value = 'service';
        document.getElementById('serviceDate').value = DateUtil.today();
        document.getElementById('serviceValidUntil').value = '';
        document.getElementById('serviceDescription').value = '';
        const currentOdo = DataManager.getCurrentOdometer(activeVehicle.id);
        document.getElementById('serviceOdometer').value = '';
        document.getElementById('serviceOdometer').placeholder = currentOdo ? `Volitelné (naposledy ${currentOdo})` : 'Volitelné';
        document.getElementById('serviceNextOdometer').value = '';
        document.getElementById('serviceCost').value = '';
        document.getElementById('serviceNote').value = '';
    }

    onServiceTypeChange();
    document.getElementById('serviceModal').classList.add('active');
}

function onServiceTypeChange() {
    const type = document.getElementById('serviceType').value;
    const validUntilGroup = document.getElementById('serviceValidUntilGroup');
    const nextOdoGroup = document.getElementById('serviceNextOdoGroup');

    // Show validity field for items that expire
    const hasValidity = type === 'vignette' || type === 'insurance' || type === 'inspection';
    validUntilGroup.style.display = hasValidity ? 'block' : 'none';

    // Next service by odometer - for repairs/maintenance
    nextOdoGroup.style.display = (type === 'service' || type === 'other') ? 'block' : 'none';
}

function saveServiceRecord() {
    try {
        const id = document.getElementById('serviceId').value;
        const vehicleId = document.getElementById('serviceVehicleId').value;
        const type = document.getElementById('serviceType').value;
        const date = document.getElementById('serviceDate').value;
        const hasValidity = type === 'vignette' || type === 'insurance' || type === 'inspection';
        const hasNextOdo = type === 'service' || type === 'other';
        const validUntil = hasValidity ? document.getElementById('serviceValidUntil').value : '';
        const description = document.getElementById('serviceDescription').value.trim();
        const odometerStr = String(document.getElementById('serviceOdometer').value).replace(/\s/g, '');
        const nextOdoStr = hasNextOdo ? String(document.getElementById('serviceNextOdometer').value).replace(/\s/g, '') : '';
        const cost = parseNum(document.getElementById('serviceCost').value);
        const note = document.getElementById('serviceNote').value.trim();

        if (!date) {
            showNotification('Zadejte datum');
            return;
        }
        if (!description) {
            showNotification('Zadejte popis záznamu');
            return;
        }
        if (validUntil && validUntil < date) {
            showNotification('Platnost do nemůže být před datem záznamu');
            return;
        }
        if (!isNaN(cost) && cost < 0) {
            showNotification('Cena nemůže být záporná');
            return;
        }

        const odometer = odometerStr ? parseInt(odometerStr, 10) : null;
        const nextOdometer = nextOdoStr ? parseInt(nextOdoStr, 10) : null;
        if ((odometerStr && !(odometer > 0)) || (nextOdoStr && !(nextOdometer > 0))) {
            showNotification('Zadejte platný stav tachometru');
            return;
        }
        if (odometer && nextOdometer && nextOdometer <= odometer) {
            showNotification('Příští servis musí být při vyšším stavu tachometru');
            return;
        }

        const data = {
            id: id || null,
            vehicleId,
            type,
            date,
            validUntil: validUntil || null,
            description,
            odometer,
            nextOdometer,
            cost: isNaN(cost) ? 0 : cost,
            note
        };

        let success = false;
        if (id) {
            success = DataManager.updateService(data);
            if (success) showNotification('Záznam upraven');
        } else {
            const result = DataManager.addService(data);
            success = result !== null;
            if (success) showNotification('Záznam přidán');
        }

        if (!success) {
            showNotification('Chyba při ukládání');
            return;
        }

        closeModal('serviceModal');
        refreshCurrentView();
    } catch (e) {
        Logger.error('Service', 'Failed to save service record', { error: e.message });
        showNotification('Chyba při ukládání');
    }
}

function deleteServiceRecord(id) {
    const service = DataManager.getService(id);
    const label = service ? ` "${service.description}"` : '';
    if (confirm(`Opravdu smazat záznam${label}?`)) {
        const success = DataManager.deleteService(id);
        if (success) {
            showNotification('Záznam smazán');
            refreshCurrentView();
        } else {
            showNotification('Chyba při mazání');
        }
    }
}

function renderSettings() {
    try {
        Logger.debug('Settings', 'Rendering settings');

        const settings = DataManager.state.settings;
        const errorLogs = Logger.getPersistedErrors();
        const errorCount = errorLogs.length;

        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Nastavení</h2>
                </div>

                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">Vzhled</h3>
                <div class="settings-group">
                    <div class="settings-item">
                        <div>
                            <div>Auto tmavý režim</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Podle systému</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${settings.darkModeAuto ? 'checked' : ''} onchange="toggleAutoDarkMode()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                ${!settings.darkModeAuto ? `
                <div class="settings-group">
                    <div class="settings-item">
                        <div>
                            <div>Tmavý režim</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Ruční ovládání</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${settings.darkMode ? 'checked' : ''} onchange="toggleDarkMode()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                ` : ''}

                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">Cloud synchronizace</h3>
                <div class="settings-group">
                    <div class="settings-item">
                        <div>
                            <div>Synchronizace do cloudu</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Zálohovat data automaticky
                            </div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${settings.cloudSync ? 'checked' : ''} onchange="toggleCloudSync(this)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                ${typeof CloudSync !== 'undefined' ? `
                <div class="settings-group">
                    <div class="settings-item">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="material-symbols-outlined" style="font-size: 16px; color: ${CloudSync.isOnline() ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)'};">
                                    ${CloudSync.isOnline() ? 'cloud_done' : 'cloud_off'}
                                </span>
                                <span>${CloudSync.isOnline() ? 'Online' : 'Offline'}</span>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Poslední sync: ${escapeHtml(CloudSync.getSyncStatus().lastSyncFormatted)}
                                ${settings.cloudSync && CloudSync.hasPendingChanges() ? '<br>Čekají neodeslané změny' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="settings-group" onclick="syncNow()">
                    <div class="settings-item">
                        <span>Synchronizovat nyní</span>
                        <span class="material-symbols-outlined">sync</span>
                    </div>
                </div>
                <div class="settings-group" onclick="showSyncId()">
                    <div class="settings-item">
                        <div>
                            <div>Zobrazit Sync ID</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Pro obnovení dat na jiném zařízení
                            </div>
                        </div>
                        <span class="material-symbols-outlined">key</span>
                    </div>
                </div>
                <div class="settings-group" onclick="restoreFromId()">
                    <div class="settings-item">
                        <div>
                            <div>Obnovit z jiného zařízení</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Zadejte Sync ID pro stažení dat
                            </div>
                        </div>
                        <span class="material-symbols-outlined">cloud_download</span>
                    </div>
                </div>
                ` : ''}

                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">Tankování</h3>
                <div class="settings-group">
                    <div class="settings-item">
                        <div>
                            <div>Nejnižší cena za litr</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                V ${escapeHtml(settings.currency)}/l, levnější tankování appka odmítne
                            </div>
                        </div>
                        <input type="number" id="settingMinPrice" class="text-field" step="0.1" min="0"
                            style="width: 100px; text-align: right;"
                            value="${escapeHtml(settings.minPrice)}" onchange="savePriceLimits()">
                    </div>
                    <div class="settings-item">
                        <div>
                            <div>Nejvyšší cena za litr</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                V ${escapeHtml(settings.currency)}/l, dražší tankování appka odmítne
                            </div>
                        </div>
                        <input type="number" id="settingMaxPrice" class="text-field" step="0.1" min="0"
                            style="width: 100px; text-align: right;"
                            value="${escapeHtml(settings.maxPrice)}" onchange="savePriceLimits()">
                    </div>
                </div>

                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">Data</h3>
                <div class="settings-group" onclick="exportData()">
                    <div class="settings-item">
                         <span>Exportovat data (JSON)</span>
                         <span class="material-symbols-outlined">download</span>
                    </div>
                </div>
                <div class="settings-group" onclick="exportCSV()">
                    <div class="settings-item">
                         <div>
                             <div>Exportovat do CSV</div>
                             <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Pro Excel a tabulky</div>
                         </div>
                         <span class="material-symbols-outlined">table_chart</span>
                    </div>
                </div>
                <div class="settings-group" onclick="importData()">
                    <div class="settings-item">
                         <div>
                             <div>Importovat data</div>
                             <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Přepíše data v tomto zařízení (předtím se zazálohují)</div>
                         </div>
                         <span class="material-symbols-outlined">upload</span>
                    </div>
                </div>
                <div class="settings-group" onclick="viewBackups()">
                    <div class="settings-item">
                         <div>
                             <div>Zálohy v zařízení</div>
                             <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                 ${DataManager.listBackups().length} automatických záloh (před importem, obnovou, migrací)
                             </div>
                         </div>
                         <span class="material-symbols-outlined">restore</span>
                    </div>
                </div>

                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">Ladění a logy</h3>
                <div class="settings-group" onclick="viewLogs()">
                    <div class="settings-item">
                         <div>
                             <div>Zobrazit logy</div>
                             <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                 ${errorCount > 0 ? errorCount + ' chyb zaznamenaných' : 'Žádné chyby'}
                             </div>
                         </div>
                         <span class="material-symbols-outlined">bug_report</span>
                    </div>
                </div>
                <div class="settings-group" onclick="exportLogs()">
                    <div class="settings-item">
                         <span>Exportovat logy</span>
                         <span class="material-symbols-outlined">download</span>
                    </div>
                </div>
                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">Údržba aplikace</h3>
                <div class="settings-group" onclick="forceUpdateApp()">
                    <div class="settings-item">
                        <div>
                            <div>Vynutit aktualizaci</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Vyčistí mezipaměť a znovu načte aplikaci
                            </div>
                        </div>
                        <span class="material-symbols-outlined">refresh</span>
                    </div>
                </div>

                <div class="settings-group" onclick="clearLogs()">
                    <div class="settings-item">
                         <span style="color: var(--md-sys-color-error);">Smazat logy</span>
                         <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
                    </div>
                </div>

                <h3 style="font-size: 1rem; margin: 16px 0 8px; color: var(--md-sys-color-primary);">O aplikaci</h3>
                <div class="settings-group" onclick="showChangelog()">
                    <div class="settings-item">
                        <div>
                            <div>Historie verzí</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Zobrazit změny a nové funkce
                            </div>
                        </div>
                        <span class="material-symbols-outlined">update</span>
                    </div>
                </div>
                <div class="settings-group">
                    <div class="settings-item" style="cursor: default;">
                        <div>
                            <div>Verze aplikace</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                FuelTracker v${APP_VERSION}
                            </div>
                        </div>
                        <span class="material-symbols-outlined">info</span>
                    </div>
                </div>
                <div class="settings-group">
                    <div class="settings-item" style="cursor: default;">
                        <div>
                            <div>Verze dat</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                ${DataManager.DATA_VERSION}
                            </div>
                        </div>
                        <span class="material-symbols-outlined">database</span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('mainContent').innerHTML = content;
    } catch (e) {
        Logger.error('Settings', 'Failed to render settings', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při načítání nastavení');
    }
}

/**
 * Force update the app by unregistering service workers and clearing caches
 */
async function forceUpdateApp() {
    if (!confirm("Vynutit aktualizaci? Aplikace vyčistí mezipaměť (Cache) a restartuje se.")) {
        return;
    }

    try {
        Logger.info('App', 'Force update initiated');
        showNotification("Aktualizuji aplikaci...");

        // 1. Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
                Logger.debug('App', 'ServiceWorker unregistered');
            }
        }

        // 2. Delete all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (let name of cacheNames) {
                await caches.delete(name);
                Logger.debug('App', 'Cache deleted', { name });
            }
        }

        // 3. Clear session storage
        sessionStorage.clear();

        // 4. Force reload from server
        Logger.info('App', 'Redirecting to reload');

        setTimeout(() => {
            window.location.reload(true);
        }, 1000);

    } catch (e) {
        Logger.error('App', 'Force update failed', { error: e.message });
        window.location.reload();
    }
}

// === Chart (SVG Construction) ===
function renderLineChart(dataPoints) {
    // dataPoints = [{date, value}, ...]
    if (!dataPoints || !Array.isArray(dataPoints) || dataPoints.length < 2) {
        return '<div style="display:flex; align-items:center; justify-content:center; height:100%; color: var(--md-sys-color-outline);">Málo dat pro graf</div>';
    }

    // Filter out invalid data points
    const validPoints = dataPoints.filter(d => d && typeof d.value === 'number' && !isNaN(d.value) && isFinite(d.value));

    if (validPoints.length < 2) {
        return '<div style="display:flex; align-items:center; justify-content:center; height:100%; color: var(--md-sys-color-outline);">Málo dat pro graf</div>';
    }

    // Limits
    const values = validPoints.map(d => d.value);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;
    let range = maxVal - minVal;

    // Prevent division by zero - if all values are the same, use a default range
    if (range === 0 || !isFinite(range)) {
        range = 1;
    }

    const width = 600;
    const height = 200;
    const padding = 20;

    let points = "";

    validPoints.forEach((pt, i) => {
        const x = padding + (i / (validPoints.length - 1)) * (width - 2 * padding);
        const y = height - (padding + ((pt.value - minVal) / range) * (height - 2 * padding));
        points += `${x},${y} `;
    });

    // Simple polyline
    return `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%;">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--md-sys-color-primary);stop-opacity:0.2" />
                    <stop offset="100%" style="stop-color:var(--md-sys-color-primary);stop-opacity:0" />
                </linearGradient>
            </defs>
            <!-- Grid Lines -->
            <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="var(--md-sys-color-outline-variant)" stroke-dasharray="4" />

            <!-- Area Fill (Closed Loop) -->
            <polyline points="${padding},${height} ${points} ${width - padding},${height}" fill="url(#grad)" stroke="none" />

            <!-- Line -->
            <polyline points="${points}" fill="none" stroke="var(--md-sys-color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Points -->
            ${validPoints.map((pt, i) => {
        const x = padding + (i / (validPoints.length - 1)) * (width - 2 * padding);
        const y = height - (padding + ((pt.value - minVal) / range) * (height - 2 * padding));
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-primary)" stroke-width="2" />`;
    }).join('')}
        </svg>
    `;
}


// === Modals & Modifiers ===
function openCarModal(editId = null) {
    const modal = document.getElementById('carModal');
    const titleEl = document.getElementById('carModalTitle');

    // Clear all fields first
    document.getElementById('carName').value = '';
    document.getElementById('carMaker').value = '';
    document.getElementById('carType').value = '';
    document.getElementById('carEngine').value = '';
    document.getElementById('carTank').value = '';
    document.getElementById('carLicensePlate').value = '';
    document.getElementById('carYear').value = '';
    document.getElementById('carId').value = '';

    if (editId) {
        // Edit mode - populate fields
        const vehicle = DataManager.getVehicle(editId);
        if (vehicle) {
            titleEl.textContent = 'Upravit auto';
            document.getElementById('carId').value = vehicle.id;
            document.getElementById('carName').value = vehicle.name || '';
            document.getElementById('carMaker').value = vehicle.manufacturer || '';
            document.getElementById('carType').value = vehicle.type || '';
            document.getElementById('carEngine').value = vehicle.engine || '';
            document.getElementById('carTank').value = vehicle.tankSize || '';
            document.getElementById('carLicensePlate').value = vehicle.licensePlate || '';
            document.getElementById('carYear').value = vehicle.year || '';
        }
    } else {
        titleEl.textContent = 'Nové auto';
    }

    modal.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function saveCar() {
    const name = document.getElementById('carName').value.trim();
    const maker = document.getElementById('carMaker').value.trim();
    const type = document.getElementById('carType').value.trim();
    const engine = document.getElementById('carEngine').value.trim();
    const tankStr = document.getElementById('carTank').value;
    const licensePlate = document.getElementById('carLicensePlate').value.trim();
    const yearStr = document.getElementById('carYear').value;
    const id = document.getElementById('carId').value;

    if (!name) {
        showNotification('Zadejte název auta.');
        return;
    }

    // Validate tank size
    let tankSize = null;
    if (tankStr) {
        tankSize = parseNum(tankStr);
        if (!isFinite(tankSize) || tankSize < 1) {
            showNotification('Zadejte platný objem nádrže (min. 1 l).');
            return;
        }
        if (tankSize > 500) {
            showNotification('Objem nádrže je příliš velký (max. 500 l).');
            return;
        }
    }

    // Validate year
    let year = null;
    if (yearStr) {
        year = parseInt(yearStr);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
            showNotification(`Zadejte platný rok výroby (1900-${currentYear + 1}).`);
            return;
        }
    }

    DataManager.saveVehicle({
        id: id || null,
        name,
        manufacturer: maker,
        type,
        engine,
        tankSize: tankSize,
        licensePlate: licensePlate || null,
        year: year,
        isDefault: false
    });

    closeModal('carModal');
    showNotification(id ? 'Auto upraveno!' : 'Auto uloženo!');
    renderApp(); // Refresh all
}

function deleteCar(id) {
    const vehicle = DataManager.getVehicle(id);
    if (!vehicle) return;
    const refuelCount = DataManager.getRefuels(id).length;
    const serviceCount = DataManager.getServices(id).length;
    if (confirm(`Opravdu smazat auto "${vehicle.name}" a všechna jeho data?\n(${refuelCount} tankování, ${serviceCount} servisních záznamů)`)) {
        DataManager.deleteVehicle(id);
        renderApp();
        showNotification("Auto smazáno.");
    }
}

// === Settings Logic ===
function toggleDarkMode() {
    DataManager.updateSettings({ darkMode: !DataManager.state.settings.darkMode });
    renderSettings(); // stay in Settings
}

/**
 * Uloží povolený rozsah ceny za litr z Nastavení.
 * Hodnoty rovnou omezují, co jde zadat u tankování, takže se validují
 * a při nesmyslu se políčka vrátí na poslední platný stav.
 */
function savePriceLimits() {
    const minEl = document.getElementById('settingMinPrice');
    const maxEl = document.getElementById('settingMaxPrice');
    if (!minEl || !maxEl) return;

    const min = parseNum(minEl.value);
    const max = parseNum(maxEl.value);
    const settings = DataManager.state.settings;

    if (isNaN(min) || isNaN(max) || min < 0 || max <= 0) {
        showNotification('Zadejte platné ceny (kladná čísla).');
        minEl.value = settings.minPrice;
        maxEl.value = settings.maxPrice;
        return;
    }

    if (min >= max) {
        showNotification('Nejnižší cena musí být menší než nejvyšší.');
        minEl.value = settings.minPrice;
        maxEl.value = settings.maxPrice;
        return;
    }

    DataManager.updateSettings({ minPrice: min, maxPrice: max });
    showNotification(`Rozsah ceny nastaven na ${min}-${max} ${settings.currency}/l`);
}

function toggleAutoDarkMode() {
    DataManager.updateSettings({ darkModeAuto: !DataManager.state.settings.darkModeAuto });
    renderSettings(); // stay in Settings
}

/** Trigger a file download */
function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking immediately can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Safe part of a file name */
function fileSafe(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'auto';
}

function exportData() {
    try {
        const exportPayload = {
            ...DataManager.exportData(),
            _syncId: typeof CloudSync !== 'undefined' ? CloudSync.getUserId() : null,
            _exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportPayload, null, 2);
        downloadBlob(new Blob([dataStr], { type: "application/json" }),
            `fuel_tracker_zaloha_${DateUtil.today()}.json`);

        Logger.info('Settings', 'Export successful');
        showNotification('Data exportována');
    } catch (e) {
        Logger.error('Settings', 'Export failed', { error: e.message });
        showNotification('Chyba při exportu dat');
    }
}

/**
 * CSV for Czech Excel: semicolon separator, decimal comma, UTF-8 BOM.
 */
function exportCSV() {
    try {
        const activeVehicle = DataManager.getActiveVehicle();
        if (!activeVehicle) {
            showNotification('Nejprve vyberte vozidlo');
            return;
        }

        const refuels = DataManager.getRefuels(activeVehicle.id);
        if (refuels.length === 0) {
            showNotification('Žádná data k exportu');
            return;
        }

        // Same consumption calculation as everywhere else
        const consumptionMap = DataManager.calculateConsumptionForRefuels(activeVehicle.id);
        const currency = DataManager.state.settings.currency;

        const dec = (n, d) => (isFinite(Number(n)) ? Number(n).toFixed(d).replace('.', ',') : '');
        const text = t => `"${String(t === null || t === undefined ? '' : t).replace(/"/g, '""')}"`;

        const headers = [
            'Datum',
            'Stav tachometru (km)',
            'Natankováno (l)',
            `Cena za litr (${currency})`,
            `Celková cena (${currency})`,
            'Plná nádrž',
            'Předchozí nezapsáno',
            'Poznámka',
            'Spotřeba (l/100km)'
        ];

        const rows = [headers.map(text).join(';')];

        refuels.forEach((refuel) => {
            const consumption = consumptionMap[refuel.id];
            rows.push([
                DateUtil.format(refuel.date),
                refuel.odometer,
                dec(refuel.liters, 2),
                dec(refuel.pricePerLiter, 2),
                dec(refuel.totalPrice, 2),
                refuel.isFullTank ? 'Ano' : 'Ne',
                refuel.missedPrevious ? 'Ano' : 'Ne',
                text(refuel.notes || ''),
                consumption !== null && consumption !== undefined ? dec(consumption, 1) : ''
            ].join(';'));
        });

        const BOM = '﻿';
        downloadBlob(new Blob([BOM + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' }),
            `fuel_tracker_${fileSafe(activeVehicle.name)}_${DateUtil.today()}.csv`);

        Logger.info('Settings', 'CSV export successful', { rowsCount: refuels.length });
        showNotification('CSV exportován');
    } catch (e) {
        Logger.error('Settings', 'Failed to export CSV', { error: e.message, stack: e.stack });
        showNotification('Chyba při exportu CSV');
    }
}

/**
 * Import a JSON backup.
 * - asks before overwriting, backs up current data first
 * - validates and migrates the file (DataManager.importData)
 * - switches the Sync ID only when the user agrees
 */
function importData() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async ev => {
                let data;
                try {
                    data = JSON.parse(ev.target.result);
                } catch (err) {
                    showNotification("Chyba: Soubor není platný JSON.");
                    return;
                }

                if (!data || !Array.isArray(data.vehicles) || !Array.isArray(data.refuels)) {
                    showNotification("Chyba: Soubor neobsahuje data FuelTrackeru.");
                    return;
                }

                let ageText = '';
                if (data._exportDate) {
                    const days = Math.floor((Date.now() - new Date(data._exportDate).getTime()) / 86400000);
                    if (days >= 0) ageText = `\nZáloha je ${pluralDays(days)} stará.`;
                }

                const ok = confirm(
                    `Import přepíše všechna data v tomto zařízení:\n` +
                    `${data.vehicles.length} aut, ${data.refuels.length} tankování, ` +
                    `${Array.isArray(data.services) ? data.services.length : 0} servisních záznamů.${ageText}\n\n` +
                    `Současná data se nejdřív automaticky zazálohují (Nastavení > Zálohy v zařízení). Pokračovat?`);
                if (!ok) return;

                const fileSyncId = data._syncId;
                const cleanData = { ...data };
                delete cleanData._syncId;
                delete cleanData._exportDate;
                delete cleanData._lastSync;
                delete cleanData._deviceInfo;
                delete cleanData._rev;

                if (!DataManager.importData(cleanData, { backupReason: 'před importem souboru' })) {
                    showNotification("Chyba: Data v souboru jsou neplatná.");
                    return;
                }

                // Sync ID from the file - only after explicit confirmation
                if (typeof CloudSync !== 'undefined' && fileSyncId && CloudSync.isValidUserId(fileSyncId) &&
                    fileSyncId !== CloudSync.getUserId()) {
                    if (confirm('Soubor obsahuje jiné Sync ID (z jiného zařízení).\n\nPřepnout cloud synchronizaci na toto ID? Zvolte OK jen u vlastní zálohy.')) {
                        CloudSync.setUserId(fileSyncId);
                    }
                }

                renderApp();
                showNotification("Data úspěšně obnovena!");
                Logger.info('Settings', 'Data import successful');

                // Merge with the cloud (nothing is overwritten - records are joined)
                if (typeof CloudSync !== 'undefined' && CloudSync.isEnabled() && CloudSync.isOnline()) {
                    const result = await CloudSync.fullSync();
                    if (result.success) {
                        showNotification(result.changed ? 'Import sloučen s daty v cloudu' : 'Data synchronizována', 'cloud_done');
                        if (result.changed) refreshCurrentView();
                    } else {
                        showNotification('Import OK, cloud sync selhal: ' + result.error, 'warning');
                    }
                }
            };

            reader.onerror = () => {
                showNotification("Chyba při čtení souboru.");
            };

            reader.readAsText(file);
        };
        input.click();
    } catch (e) {
        Logger.error('Settings', 'Failed to initiate data import', { error: e.message });
        showNotification('Chyba při importu dat');
    }
}

// === Backups ===
function viewBackups() {
    const backups = DataManager.listBackups();
    const list = backups.length === 0
        ? '<p style="text-align: center; color: var(--md-sys-color-outline); padding: 20px;">Zatím žádné zálohy. Vytvoří se automaticky před importem, obnovou a aktualizací dat.</p>'
        : backups.map(b => `
            <div class="log-item" style="cursor: default;">
                <div>
                    <div class="log-main">${escapeHtml(b.createdAt ? new Date(b.createdAt).toLocaleString('cs-CZ') : '?')}</div>
                    <div class="log-sub">${escapeHtml(b.reason)} • ${b.vehiclesCount} aut, ${b.refuelsCount} tankování</div>
                </div>
                <button class="button text-button" onclick="restoreBackupFromSettings('${escapeHtml(b.key)}')">Obnovit</button>
            </div>`).join('');

    document.getElementById('mainContent').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">restore</span>
                    Zálohy v zařízení
                </h2>
                <button class="button text-button" onclick="renderSettings()" aria-label="Zavřít">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <p style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 12px;">
                Aplikace drží poslední ${MAX_BACKUPS} zálohy v tomto prohlížeči. Pro jistotu občas exportujte data do souboru.
            </p>
            ${list}
        </div>`;
}

function restoreBackupFromSettings(key) {
    if (!/^fuelTrackerBackup_\d+$/.test(key)) return;
    if (!confirm('Obnovit data z této zálohy? Současná data se nejdřív zazálohují.')) return;
    if (DataManager.restoreBackup(key)) {
        showNotification('Záloha obnovena');
        renderApp('settings');
        if (typeof CloudSync !== 'undefined' && CloudSync.isEnabled()) CloudSync.scheduleSync();
    } else {
        showNotification('Zálohu se nepodařilo obnovit');
    }
}

// === Utils ===
let notificationTimeout = null;

function showNotification(msg, icon = 'info') {
    const el = document.getElementById('notification');
    const msgEl = document.getElementById('notificationMessage');
    if (!el || !msgEl) return;
    msgEl.textContent = msg;
    const iconEl = el.querySelector('.notification-icon');
    if (iconEl) iconEl.textContent = icon || 'info';
    el.style.display = 'flex';
    // A new message restarts the timer (older timers used to hide it early)
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        el.style.display = 'none';
        notificationTimeout = null;
    }, 3500);
}

function formatDate(isoDate) {
    return DateUtil.format(isoDate);
}

// === Log Management Functions ===
function viewLogs() {
    try {
        const allLogs = Logger.logs;
        const errorLogs = Logger.getPersistedErrors();

        let logsHtml = '';

        if (allLogs.length === 0 && errorLogs.length === 0) {
            logsHtml = '<p style="text-align: center; color: var(--md-sys-color-outline); padding: 20px;">Žádné logy k zobrazení</p>';
        } else {
            if (errorLogs.length > 0) {
                logsHtml += '<h3 style="font-size: 0.9rem; margin: 12px 0; color: var(--md-sys-color-error);">Uložené chyby</h3>';
                errorLogs.slice().reverse().forEach(log => {
                    logsHtml += formatLogEntry(log);
                });
            }

            if (allLogs.length > 0) {
                logsHtml += '<h3 style="font-size: 0.9rem; margin: 12px 0; color: var(--md-sys-color-primary);">Aktuální logy</h3>';
                allLogs.slice().reverse().forEach(log => {
                    logsHtml += formatLogEntry(log);
                });
            }
        }

        const content = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <span class="material-symbols-outlined">bug_report</span>
                        Systémové logy
                    </h2>
                    <button class="button text-button" onclick="renderSettings()" aria-label="Zavřít">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div style="max-height: 70vh; overflow-y: auto;">
                    ${logsHtml}
                </div>
            </div>
        `;

        DomHelper.setContent('mainContent', content);
    } catch (e) {
        Logger.error('Settings', 'Failed to view logs', { error: e.message });
        showNotification('Chyba při zobrazení logů');
    }
}

/**
 * Log entries contain user input (notes, imported data) - everything is escaped.
 */
function formatLogEntry(log) {
    const levelColors = {
        DEBUG: 'var(--md-sys-color-outline)',
        INFO: 'var(--md-sys-color-primary)',
        WARN: '#ff9800',
        ERROR: 'var(--md-sys-color-error)',
        FATAL: '#b71c1c'
    };

    const color = levelColors[log.level] || 'var(--md-sys-color-on-surface)';
    const ts = new Date(log.timestamp);
    const time = isNaN(ts.getTime()) ? '' : ts.toLocaleTimeString('cs-CZ');
    const date = isNaN(ts.getTime()) ? '' : ts.toLocaleDateString('cs-CZ');
    let dataText = '';
    if (log.data) {
        try { dataText = JSON.stringify(log.data, null, 2); } catch (e) { dataText = String(log.data); }
    }
    const message = typeof log.message === 'string' ? log.message : JSON.stringify(log.message);

    return `
        <div class="log-item" style="border-left: 3px solid ${color}; margin-bottom: 8px; padding-left: 12px; cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: start; width: 100%; gap: 8px;">
                <div style="min-width: 0;">
                    <div class="log-main" style="color: ${color}; font-weight: 500;">
                        [${escapeHtml(log.level)}] ${escapeHtml(log.category)}
                    </div>
                    <div class="log-sub">${escapeHtml(message)}</div>
                    ${dataText ? `<pre style="font-size: 0.7rem; margin: 4px 0 0 0; color: var(--md-sys-color-outline); overflow-x: auto; white-space: pre-wrap; word-break: break-word;">${escapeHtml(dataText)}</pre>` : ''}
                </div>
                <div class="log-sub" style="text-align: right; white-space: nowrap;">
                    ${escapeHtml(date)}<br>${escapeHtml(time)}
                </div>
            </div>
        </div>
    `;
}

function exportLogs() {
    try {
        Logger.exportLogs();
        showNotification('Logy exportovány');
    } catch (e) {
        Logger.error('Settings', 'Failed to export logs', { error: e.message });
        showNotification('Chyba při exportu logů');
    }
}

function clearLogs() {
    try {
        if (confirm('Opravdu smazat všechny logy?')) {
            Logger.clearLogs();
            Logger.clearPersistedErrors();
            showNotification('Logy smazány');
            renderSettings();
        }
    } catch (e) {
        Logger.error('Settings', 'Failed to clear logs', { error: e.message });
        showNotification('Chyba při mazání logů');
    }
}

// === Cloud Sync Functions ===
function toggleCloudSync(checkbox) {
    DataManager.updateSettings({ cloudSync: checkbox.checked });
    Logger.info('Settings', 'Cloud sync toggled', { enabled: checkbox.checked });

    if (checkbox.checked && typeof CloudSync !== 'undefined') {
        showNotification('Synchronizuji...', 'cloud_sync');
        CloudSync.fullSync().then(result => {
            if (result.success) {
                showNotification('Data synchronizována', 'cloud_done');
            } else {
                showNotification('Chyba synchronizace: ' + result.error, 'warning');
            }
            if (currentTab === 'settings') renderSettings();
        });
    } else {
        renderSettings();
    }
}

async function syncNow() {
    if (typeof CloudSync === 'undefined') {
        showNotification('Cloud sync není dostupný');
        return;
    }
    if (!CloudSync.isEnabled()) {
        showNotification('Nejdřív zapněte synchronizaci do cloudu');
        return;
    }

    showNotification('Synchronizuji...', 'cloud_sync');
    const result = await CloudSync.fullSync();

    if (result.success) {
        showNotification(result.changed ? 'Data synchronizována a sloučena' : 'Data synchronizována', 'cloud_done');
        refreshCurrentView();
    } else {
        showNotification('Chyba: ' + result.error, 'warning');
    }
}

function showSyncId() {
    if (typeof CloudSync === 'undefined') {
        showNotification('Cloud sync není dostupný');
        return;
    }

    const status = CloudSync.getSyncStatus();
    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">key</span>
                    Vaše Sync ID
                </h2>
                <button class="button text-button" onclick="renderSettings()" aria-label="Zavřít">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <p style="margin-bottom: 16px; color: var(--md-sys-color-on-surface-variant);">
                Toto ID použijte pro obnovení dat na jiném zařízení.
                <strong>Je to klíč k vašim datům v cloudu - nesdílejte ho.</strong>
            </p>
            <div style="background: var(--md-sys-color-surface-variant); padding: 16px; border-radius: 12px; word-break: break-all; font-family: monospace; margin-bottom: 16px;">
                ${escapeHtml(status.userId)}
            </div>
            <button class="button filled-button" style="width: 100%;" onclick="copySyncId()">
                <span class="material-symbols-outlined">content_copy</span>
                Zkopírovat do schránky
            </button>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

async function copySyncId() {
    if (typeof CloudSync !== 'undefined') {
        const success = await CloudSync.copyUserId();
        showNotification(success ? 'ID zkopírováno do schránky' : 'Nepodařilo se zkopírovat');
    }
}

/**
 * Show changelog modal with version history
 */
function showChangelog() {
    try {
        Logger.info('Changelog', 'Showing changelog');

        // Generate changelog HTML
        const changelogHtml = CHANGELOG.map(version => {
            const versionClass = version.version === APP_VERSION ? 'current-version' : '';

            const changesHtml = version.changes.map(change => {
                const typeIcon = {
                    'feature': '✨',
                    'improvement': '🔧',
                    'fix': '🐛'
                }[change.type] || '📌';

                const typeColor = {
                    'feature': 'var(--md-sys-color-primary)',
                    'improvement': 'var(--md-sys-color-tertiary)',
                    'fix': 'var(--md-sys-color-error)'
                }[change.type] || 'var(--md-sys-color-outline)';

                return `
                    <div class="changelog-item">
                        <div style="display: flex; align-items: start; gap: 8px;">
                            <span style="font-size: 1.2rem; flex-shrink: 0;">${typeIcon}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; color: ${typeColor}; margin-bottom: 2px;">
                                    ${escapeHtml(change.title)}
                                </div>
                                <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">
                                    ${escapeHtml(change.description)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="changelog-version ${versionClass}">
                    <div class="changelog-header">
                        <div>
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                                v${escapeHtml(version.version)}
                                ${version.version === APP_VERSION ? '<span class="version-badge">Aktuální</span>' : ''}
                            </h3>
                            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-top: 4px;">
                                ${escapeHtml(new Date(version.date).toLocaleDateString('cs-CZ'))}
                            </div>
                        </div>
                    </div>
                    <div class="changelog-changes">
                        ${changesHtml}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('changelogContent').innerHTML = changelogHtml;
        document.getElementById('changelogModal').classList.add('active');

    } catch (e) {
        Logger.error('Changelog', 'Failed to show changelog', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při zobrazení historie verzí');
    }
}

/**
 * Restore from another device: the data for the entered ID are downloaded
 * first. Only if they exist, local data are backed up and replaced and the
 * device switches to that Sync ID.
 */
async function restoreFromId() {
    if (typeof CloudSync === 'undefined') {
        showNotification('Cloud sync není dostupný');
        return;
    }

    const input = prompt('Zadejte Sync ID z jiného zařízení:');
    if (!input) return;
    const userId = input.trim();

    if (!CloudSync.isValidUserId(userId)) {
        showNotification('Neplatné Sync ID');
        return;
    }
    if (userId === CloudSync.getUserId()) {
        showNotification('Toto zařízení už používá toto Sync ID');
        return;
    }
    if (!confirm('Data v tomto zařízení se nahradí daty z cloudu (současná data se nejdřív zazálohují). Pokračovat?')) {
        return;
    }

    showNotification('Stahuji data...', 'cloud_download');
    const result = await CloudSync.restoreFromUserId(userId);

    if (result.success) {
        showNotification('Data úspěšně obnovena!', 'cloud_done');
        renderApp('dashboard');
    } else {
        showNotification(result.notFound ? result.error : 'Chyba: ' + result.error, 'warning');
    }
}

// === Charts and Statistics Helper Functions ===

/**
 * Calculate fuel price statistics
 */
function calculateFuelPriceStats(refuels) {
    if (!refuels || refuels.length === 0) {
        return { hasData: false };
    }

    const prices = refuels.map(r => r.pricePerLiter);
    const cheapest = Math.min(...prices);
    const mostExpensive = Math.max(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const last = refuels[0].pricePerLiter; // refuels are already sorted newest first

    return {
        hasData: true,
        cheapest,
        mostExpensive,
        average,
        last
    };
}

/**
 * Initialize all statistics charts
 */
let statsCharts = {}; // Store chart instances for cleanup

function destroyStatsCharts() {
    Object.values(statsCharts).forEach(chart => {
        try { if (chart) chart.destroy(); } catch (e) { /* ignore */ }
    });
    statsCharts = {};
}

function initStatsCharts(vehicle, stats, serviceCosts, refuels, currency, retryCount = 0) {
    try {
        const MAX_RETRIES = 10; // Maximum 10 retries = 2 seconds

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            if (retryCount >= MAX_RETRIES) {
                Logger.error('Charts', 'Chart.js failed to load after maximum retries', {
                    retries: retryCount
                });
                // Show user-friendly message
                const statsContainer = document.getElementById('mainContent');
                if (statsContainer && statsContainer.querySelector('canvas')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.style.cssText = 'padding: 20px; text-align: center; color: var(--md-sys-color-error);';
                    errorMsg.innerHTML = `
                        <span class="material-symbols-outlined" style="font-size: 48px;">error</span>
                        <p>Grafy se nepodařilo načíst. Zkuste obnovit stránku.</p>
                    `;
                    // Replace first canvas with error
                    const firstCanvas = statsContainer.querySelector('canvas');
                    if (firstCanvas && firstCanvas.parentElement) {
                        firstCanvas.parentElement.appendChild(errorMsg);
                    }
                }
                return;
            }

            Logger.warn('Charts', 'Chart.js not loaded yet, retrying', {
                attempt: retryCount + 1,
                maxRetries: MAX_RETRIES
            });
            setTimeout(() => {
                initStatsCharts(vehicle, stats, serviceCosts, refuels, currency, retryCount + 1);
            }, 200);
            return;
        }

        Logger.info('Charts', 'Initializing statistics charts');

        // Destroy existing charts to prevent memory leaks
        destroyStatsCharts();

        // User left the stats tab before Chart.js was ready
        if (currentTab !== 'stats') return;

        const fuelCost = stats ? parseFloat(stats.totalCost) : 0;

        // 1. Costs Pie Chart (Fuel vs Service)
        if (fuelCost > 0 || serviceCosts.total > 0) {
            const ctx = document.getElementById('costsPieChart');
            if (ctx) {
                statsCharts.costs = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Palivo', 'Servis'],
                        datasets: [{
                            data: [fuelCost, serviceCosts.total],
                            backgroundColor: [
                                'rgba(255, 152, 0, 0.8)',
                                'rgba(33, 150, 243, 0.8)'
                            ],
                            borderColor: [
                                'rgba(255, 152, 0, 1)',
                                'rgba(33, 150, 243, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    font: { size: 13 }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed.toLocaleString('cs-CZ');
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${label}: ${value} ${currency} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // 2. Fuel Price Chart (Line)
        if (refuels.length >= 2) {
            const ctx = document.getElementById('fuelPriceChart');
            if (ctx) {
                // Sort refuels by date (oldest first for chart)
                const sortedRefuels = [...refuels].reverse();
                const labels = sortedRefuels.map(r => formatDate(r.date));
                const prices = sortedRefuels.map(r => r.pricePerLiter);

                statsCharts.fuelPrice = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `Cena (${currency}/l)`,
                            data: prices,
                            borderColor: 'rgba(76, 175, 80, 1)',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.parsed.y.toFixed(2)} ${currency}/l`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: {
                                    callback: function(value) {
                                        return value.toFixed(2) + ' ' + currency;
                                    }
                                }
                            },
                            x: {
                                ticks: {
                                    maxRotation: 45,
                                    minRotation: 45
                                }
                            }
                        }
                    }
                });
            }
        }

        // 3. Consumption Chart (Line)
        if (stats && stats.consumptions.length >= 2) {
            const ctx = document.getElementById('consumptionChart');
            if (ctx) {
                const labels = stats.consumptions.map(c => formatDate(c.date));
                const consumptions = stats.consumptions.map(c => c.value);

                statsCharts.consumption = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Spotřeba (l/100km)',
                            data: consumptions,
                            borderColor: 'rgba(244, 67, 54, 1)',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.parsed.y.toFixed(1)} l/100km`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: {
                                    callback: function(value) {
                                        return value.toFixed(1) + ' l/100km';
                                    }
                                }
                            },
                            x: {
                                ticks: {
                                    maxRotation: 45,
                                    minRotation: 45
                                }
                            }
                        }
                    }
                });
            }
        }

        // 4. Service Costs Breakdown (Doughnut)
        if (serviceCosts.total > 0) {
            const ctx = document.getElementById('serviceCostsChart');
            if (ctx) {
                const labels = [];
                const data = [];
                const colors = [
                    'rgba(63, 81, 181, 0.8)',
                    'rgba(156, 39, 176, 0.8)',
                    'rgba(0, 150, 136, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(96, 125, 139, 0.8)'
                ];

                if (serviceCosts.byType.service > 0) {
                    labels.push('Servis / Opravy');
                    data.push(serviceCosts.byType.service);
                }
                if (serviceCosts.byType.vignette > 0) {
                    labels.push('Dálniční známky');
                    data.push(serviceCosts.byType.vignette);
                }
                if (serviceCosts.byType.insurance > 0) {
                    labels.push('Pojištění');
                    data.push(serviceCosts.byType.insurance);
                }
                if (serviceCosts.byType.inspection > 0) {
                    labels.push('STK / Emise');
                    data.push(serviceCosts.byType.inspection);
                }
                if (serviceCosts.byType.other > 0) {
                    labels.push('Ostatní');
                    data.push(serviceCosts.byType.other);
                }

                statsCharts.serviceCosts = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: colors.slice(0, data.length),
                            borderColor: colors.slice(0, data.length).map(c => c.replace('0.8', '1')),
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed.toLocaleString('cs-CZ');
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${label}: ${value} ${currency} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        Logger.info('Charts', 'Charts initialized successfully');
    } catch (error) {
        Logger.error('Charts', 'Failed to initialize charts', {
            error: error.message,
            stack: error.stack
        });
    }
}
