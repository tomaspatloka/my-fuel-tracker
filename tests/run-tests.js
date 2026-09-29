/**
 * FuelTracker automated tests (no dependencies): node tests/run-tests.js
 *
 * Loads the REAL app scripts (utils, logger, data, sync) into isolated
 * browser-like contexts - one context per simulated device - and runs the
 * REAL Cloudflare function (functions/api/sync.js) against an in-memory KV.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---------- browser-like device context ----------
function createDevice(name, fetchImpl) {
    const store = new Map();
    const localStorage = {
        get length() { return store.size; },
        key: i => Array.from(store.keys())[i] ?? null,
        getItem: k => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => {
            if (localStorage._quota && String(v).length + localStorage._used() > localStorage._quota) {
                const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e;
            }
            store.set(k, String(v));
        },
        removeItem: k => store.delete(k),
        _quota: 0,
        _used: () => Array.from(store.values()).reduce((s, v) => s + v.length, 0)
    };

    const mediaListeners = [];
    const ctx = {
        console: { log() {}, info() {}, warn() {}, error() {}, debug() {} },
        localStorage,
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: require('crypto').webcrypto,
        navigator: { onLine: true, userAgent: `test-${name}` },
        window: {
            matchMedia: () => ({
                matches: false,
                addEventListener: (_t, fn) => mediaListeners.push(fn)
            }),
            addEventListener() {}
        },
        document: {
            body: { classList: { add() {}, remove() {} } },
            addEventListener() {}
        },
        fetch: (url, opts) => fetchImpl(url, opts),
        Blob, URL, TextEncoder
    };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    ['js/utils.js', 'js/logger.js', 'js/data.js', 'js/sync.js'].forEach(f => {
        vm.runInContext(read(f), ctx, { filename: f });
    });
    const dev = {
        name,
        ctx,
        store,
        mediaListeners,
        DM: vm.runInContext('DataManager', ctx),
        CS: vm.runInContext('CloudSync', ctx),
        DateUtil: vm.runInContext('DateUtil', ctx),
        Logger: vm.runInContext('Logger', ctx),
        ErrorHandler: vm.runInContext('ErrorHandler', ctx)
    };
    dev.Logger.enableConsole = false;
    dev.DM.init();
    return dev;
}

// ---------- in-memory backend using the real Pages Function ----------
async function createBackend() {
    const src = read('functions/api/sync.js');
    const mod = await import('data:text/javascript,' + encodeURIComponent(src));
    const kv = new Map();
    const env = {
        FUEL_DATA: {
            get: async (k, type) => (kv.has(k) ? (type === 'json' ? JSON.parse(kv.get(k)) : kv.get(k)) : null),
            put: async (k, v) => { kv.set(k, v); }
        }
    };
    const fetchImpl = async (url, opts = {}) => {
        const request = new Request('https://app.test' + url, {
            method: opts.method || 'GET',
            headers: opts.headers,
            body: opts.body
        });
        if (request.method === 'POST') return mod.onRequestPost({ request, env });
        return mod.onRequestGet({ request, env });
    };
    return { mod, kv, env, fetchImpl };
}

// Arrays from another vm context have a different prototype -> compare as JSON
function eqJ(actual, expected, msg) {
    assert.strictEqual(JSON.stringify(actual), JSON.stringify(expected), msg);
}

// ---------- tiny test runner ----------
const results = [];
async function test(name, fn) {
    try {
        await fn();
        results.push({ name, ok: true });
        console.log(`  ✓ ${name}`);
    } catch (e) {
        results.push({ name, ok: false, e });
        console.log(`  ✗ ${name}\n      ${e && e.stack ? e.stack.split('\n').slice(0, 3).join('\n      ') : e}`);
    }
}

function addRefuel(dev, vehicleId, date, odometer, liters, price, full = true, extra = {}) {
    const r = dev.DM.addRefuel({
        vehicleId, date, odometer, liters, pricePerLiter: price,
        totalPrice: Math.round(liters * price * 100) / 100, isFullTank: full, ...extra
    });
    assert.ok(r, `addRefuel failed ${date} ${odometer}`);
    return r;
}

function freshVehicle(dev, name = 'Test') {
    return dev.DM.saveVehicle({ name, tankSize: 50 });
}

(async () => {
    const noFetch = async () => { throw new Error('no network in this test'); };

    console.log('\nVýpočty spotřeby a nákladů');

    await test('spotřeba plná->plná s akumulací částečného tankování', () => {
        const d = createDevice('calc', noFetch);
        const v = freshVehicle(d);
        addRefuel(d, v, '2026-01-01', 10000, 40, 35);
        addRefuel(d, v, '2026-01-10', 10500, 20, 35, false);
        addRefuel(d, v, '2026-01-20', 11000, 15, 35);
        addRefuel(d, v, '2026-02-01', 11600, 36, 35);
        const map = d.DM.calculateConsumptionForRefuels(v);
        const ids = d.DM.getRefuels(v).slice().reverse().map(r => r.id);
        assert.strictEqual(map[ids[0]], null);
        assert.strictEqual(map[ids[1]], 3.5);
        assert.strictEqual(map[ids[2]], 3.5);
        assert.strictEqual(map[ids[3]], 6);
        const s = d.DM.calculateStats(v);
        assert.strictEqual(s.avgCons, '4.4');
        assert.strictEqual(s.minCons, '3.5');
        assert.strictEqual(s.maxCons, '6.0');
        assert.strictEqual(s.costPerKm, '1.55');
    });

    await test('"Palivo celkem" obsahuje i první tankování', () => {
        const d = createDevice('cost', noFetch);
        const v = freshVehicle(d);
        addRefuel(d, v, '2026-01-01', 10000, 40, 35);
        addRefuel(d, v, '2026-01-20', 11000, 35, 35);
        const s = d.DM.calculateStats(v);
        assert.strictEqual(s.totalSpent, 40 * 35 + 35 * 35);
        assert.strictEqual(s.distanceDriven, 1000);
    });

    await test('dvě tankování ve stejný den v přirozeném pořadí (doliti, pak plná)', () => {
        const d = createDevice('sameday', noFetch);
        const v = freshVehicle(d);
        addRefuel(d, v, '2026-03-01', 20000, 40, 35);
        const partial = addRefuel(d, v, '2026-03-05', 20300, 5, 35, false);
        const full = addRefuel(d, v, '2026-03-05', 20600, 40, 35);
        const map = d.DM.calculateConsumptionForRefuels(v);
        assert.strictEqual(map[partial.id], 7.5); // (5 + 40) / 600 km
        assert.strictEqual(map[full.id], 7.5);
        assert.strictEqual(d.DM.getRefuels(v)[0].id, full.id, 'newest (highest odometer) first');
    });

    await test('"předchozí tankování nezapsáno" přeruší úsek', () => {
        const d = createDevice('missed', noFetch);
        const v = freshVehicle(d);
        addRefuel(d, v, '2026-01-01', 10000, 40, 35);
        const m = addRefuel(d, v, '2026-02-01', 11500, 40, 35, true, { missedPrevious: true });
        const n = addRefuel(d, v, '2026-02-10', 12100, 36, 35);
        const map = d.DM.calculateConsumptionForRefuels(v);
        assert.strictEqual(map[m.id], null);
        assert.strictEqual(map[n.id], 6);
    });

    await test('nereálný úsek (překlep) se nezapočítá nikam', () => {
        const d = createDevice('typo', noFetch);
        const v = freshVehicle(d);
        addRefuel(d, v, '2026-01-01', 10000, 40, 35);
        const t = addRefuel(d, v, '2026-01-10', 10050, 40, 35); // 80 l/100km
        addRefuel(d, v, '2026-01-20', 10650, 36, 35);
        const map = d.DM.calculateConsumptionForRefuels(v);
        assert.strictEqual(map[t.id], null);
        const s = d.DM.calculateStats(v);
        assert.strictEqual(s.avgCons, '6.0', 'dashboard average uses the same valid segments');
    });

    await test('statistiky s jedním tankováním nespadnou', () => {
        const d = createDevice('one', noFetch);
        const v = freshVehicle(d);
        addRefuel(d, v, '2026-01-01', 10000, 40, 35);
        const s = d.DM.calculateStats(v);
        assert.strictEqual(s.hasConsumption, false);
        assert.strictEqual(s.avgCons, null);
        assert.strictEqual(s.totalSpent, 1400);
    });

    console.log('\nDatum a platnosti');

    await test('dnešní datum projde validací, zítřek ne', () => {
        const d = createDevice('date', noFetch);
        const today = d.DateUtil.today();
        assert.ok(d.ErrorHandler.validateDate(today, 'Datum').valid);
        assert.ok(!d.ErrorHandler.validateDate(d.DateUtil.addDays(today, 1), 'Datum').valid);
    });

    await test('platnost do dneška = platí (brzy vyprší), včera = prošlé', () => {
        const d = createDevice('valid', noFetch);
        const v = freshVehicle(d);
        const today = d.DateUtil.today();
        d.DM.addService({ vehicleId: v, type: 'vignette', date: d.DateUtil.addDays(today, -365), validUntil: today, description: 'Známka' });
        d.DM.addService({ vehicleId: v, type: 'inspection', date: d.DateUtil.addDays(today, -700), validUntil: d.DateUtil.addDays(today, -1), description: 'STK' });
        eqJ(d.DM.getExpiringServices(v).map(s => s.description), ['Známka']);
        eqJ(d.DM.getExpiredServices(v).map(s => s.description), ['STK']);
    });

    await test('po koupi nové známky se stará nehlásí jako prošlá', () => {
        const d = createDevice('vignette', noFetch);
        const v = freshVehicle(d);
        const today = d.DateUtil.today();
        d.DM.addService({ vehicleId: v, type: 'vignette', date: '2025-01-01', validUntil: '2025-12-31', description: 'Stará' });
        d.DM.addService({ vehicleId: v, type: 'vignette', date: today, validUntil: d.DateUtil.addDays(today, 365), description: 'Nová' });
        assert.strictEqual(d.DM.getExpiredServices(v).length, 0);
        assert.strictEqual(d.DM.getExpiringServices(v).length, 0);
    });

    await test('servis podle km upozorní 1000 km předem a po termínu', () => {
        const d = createDevice('km', noFetch);
        const v = freshVehicle(d);
        d.DM.addService({ vehicleId: v, type: 'service', date: '2026-01-01', odometer: 100000, nextOdometer: 115000, description: 'Olej' });
        addRefuel(d, v, '2026-06-01', 113500, 40, 35);
        assert.strictEqual(d.DM.getServicesDueByKm(v).length, 0);
        addRefuel(d, v, '2026-06-10', 114200, 40, 35);
        assert.strictEqual(d.DM.getServicesDueByKm(v)[0].remainingKm, 800);
        addRefuel(d, v, '2026-06-20', 115300, 40, 35);
        assert.strictEqual(d.DM.getServicesDueByKm(v)[0].remainingKm, -300);
        // new oil change resets the reminder
        d.DM.addService({ vehicleId: v, type: 'service', date: '2026-06-21', odometer: 115300, nextOdometer: 130300, description: 'Olej' });
        assert.strictEqual(d.DM.getServicesDueByKm(v).length, 0);
    });

    console.log('\nDatová vrstva');

    await test('posluchač tmavého režimu se přidá jen jednou', () => {
        const d = createDevice('theme', noFetch);
        for (let i = 0; i < 5; i++) d.DM.updateSettings({ darkModeAuto: true });
        assert.strictEqual(d.mediaListeners.length, 1);
    });

    await test('stará data bez nových nastavení dostanou výchozí hodnoty', () => {
        const d = createDevice('oldsettings', noFetch);
        d.store.set('fuelTrackerData', JSON.stringify({
            version: '2.0.0', vehicles: [{ id: 'car1', name: 'A' }],
            refuels: [{ id: 'r1', vehicleId: 'car1', date: '2026-01-01', odometer: '1000', liters: '40', pricePerLiter: '35', totalPrice: '1400', isFullTank: true }],
            settings: { darkMode: true }
        }));
        d.DM.init();
        assert.strictEqual(d.DM.state.settings.minPrice, 15);
        assert.strictEqual(d.DM.state.settings.cloudSync, false);
        assert.strictEqual(d.DM.state.settings.darkMode, true);
        assert.strictEqual(typeof d.DM.state.refuels[0].liters, 'number', 'strings converted to numbers');
        assert.ok(d.DM.listBackups().length >= 1, 'backup before migration');
    });

    await test('import: záloha před importem, cloudSync zůstane, nebezpečná ID vyřazena', () => {
        const d = createDevice('import', noFetch);
        d.DM.updateSettings({ cloudSync: true });
        const before = d.DM.listBackups().length;
        const ok = d.DM.importData({
            vehicles: [{ id: 'car1', name: 'Import' }, { id: "x');alert(1)//", name: 'Zlý' }],
            refuels: [{ id: 'r1', vehicleId: 'car1', date: '2026-01-01', odometer: 1000, liters: 40, pricePerLiter: 35, totalPrice: 1400, isFullTank: true }],
            settings: { cloudSync: false, currency: 'EUR' }
        });
        assert.ok(ok);
        assert.strictEqual(d.DM.listBackups().length, before + 1);
        assert.strictEqual(d.DM.state.settings.cloudSync, true);
        assert.strictEqual(d.DM.state.settings.currency, 'EUR');
        eqJ(d.DM.state.vehicles.map(v => v.id), ['car1']);
        assert.strictEqual(d.DM.state.settings.activeVehicleId, 'car1');
    });

    await test('neplatný import nic nepřepíše', () => {
        const d = createDevice('badimport', noFetch);
        const snapshot = JSON.stringify(d.DM.state);
        assert.strictEqual(d.DM.importData({ vehicles: 'x' }), false);
        assert.strictEqual(JSON.stringify(d.DM.state), snapshot);
    });

    await test('obnova ze zálohy', () => {
        const d = createDevice('restore', noFetch);
        const v = freshVehicle(d, 'Moje');
        addRefuel(d, v, '2026-01-01', 1000, 40, 35);
        d.DM.createBackup('test');
        const key = d.DM.listBackups()[0].key;
        d.DM.deleteVehicle(v);
        assert.strictEqual(d.DM.getVehicle(v), undefined);
        assert.ok(d.DM.restoreBackup(key));
        assert.strictEqual(d.DM.getVehicle(v).name, 'Moje');
        assert.strictEqual(d.DM.getRefuels(v).length, 1);
    });

    await test('drží se max. 3 zálohy a zálohy poškozených dat se nemažou', () => {
        const d = createDevice('backups', noFetch);
        d.store.set('fuelTrackerData_corrupted_1', 'broken');
        for (let i = 0; i < 5; i++) d.DM.createBackup('b' + i);
        assert.strictEqual(d.DM.listBackups().length, 3);
        d.DM._freeSpace();
        assert.strictEqual(d.DM.listBackups().length, 1);
        assert.strictEqual(d.store.get('fuelTrackerData_corrupted_1'), 'broken');
    });

    await test('poškozená data se zazálohují a aplikace naběhne', () => {
        const d = createDevice('corrupt', noFetch);
        d.store.set('fuelTrackerData', '{not json');
        d.DM.init();
        assert.ok(Array.from(d.store.keys()).some(k => k.startsWith('fuelTrackerData_corrupted_')));
        assert.strictEqual(d.DM.state.vehicles.length, 1);
    });

    await test('smazání auta smaže i servis a zapíše tombstones', () => {
        const d = createDevice('delcar', noFetch);
        const v = freshVehicle(d);
        const r = addRefuel(d, v, '2026-01-01', 1000, 40, 35);
        const s = d.DM.addService({ vehicleId: v, type: 'service', date: '2026-01-01', description: 'x' });
        d.DM.deleteVehicle(v);
        assert.strictEqual(d.DM.state.services.length, 0);
        assert.ok(d.DM.state.deleted[v] && d.DM.state.deleted[r.id] && d.DM.state.deleted[s.id]);
    });

    console.log('\nCloud synchronizace (2 zařízení proti skutečnému backendu)');

    const backend = await createBackend();

    await test('backend: neplatné ID 400, velká data 413, GET 405, bez CORS *', async () => {
        const bad = await backend.fetchImpl('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'hack', action: 'pull' }) });
        assert.strictEqual(bad.status, 400);
        const big = await backend.fetchImpl('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'fuel_abcdefgh12', data: { vehicles: [], refuels: [], x: 'a'.repeat(1100000) } }) });
        assert.strictEqual(big.status, 413);
        const get = await backend.fetchImpl('/api/sync?userId=fuel_abcdefgh12', { method: 'GET' });
        assert.strictEqual(get.status, 405);
        assert.strictEqual(bad.headers.get('Access-Control-Allow-Origin'), null);
    });

    const A = createDevice('A', backend.fetchImpl);
    const B = createDevice('B', backend.fetchImpl);
    let vA;

    await test('nové Sync ID má 128 bitů náhody', () => {
        assert.match(A.CS.getUserId(), /^fuel_[0-9a-f]{32}$/);
    });

    await test('zařízení A nahraje data, B se připojí stejným ID a dostane je (bez vzorového auta)', async () => {
        vA = freshVehicle(A, 'Octavia');
        A.DM.state.vehicles = A.DM.state.vehicles.filter(v => !v.isSample);
        A.DM.save({ skipCloud: true });
        addRefuel(A, vA, '2026-01-01', 10000, 40, 35);
        A.DM.updateSettings({ cloudSync: true });
        assert.ok((await A.CS.fullSync()).success);

        const r = await B.CS.restoreFromUserId(A.CS.getUserId());
        assert.ok(r.success, r.error);
        B.DM.updateSettings({ cloudSync: true });
        eqJ(B.DM.getVehicles().map(v => v.name), ['Octavia']);
        assert.strictEqual(B.DM.getRefuels(vA).length, 1);
    });

    await test('offline tankování na B + nové tankování na A = po synchronizaci má obojí každý', async () => {
        B.ctx.navigator.onLine = false;
        addRefuel(B, vA, '2026-01-15', 10600, 38, 36);
        assert.ok(B.CS.hasPendingChanges(), 'offline change remembered');
        assert.strictEqual((await B.CS.fullSync()).success, false);

        addRefuel(A, vA, '2026-01-20', 11100, 30, 36);
        assert.ok((await A.CS.fullSync()).success);

        B.ctx.navigator.onLine = true;
        const res = await B.CS.fullSync();
        assert.ok(res.success, res.error);
        assert.strictEqual(B.CS.hasPendingChanges(), false);
        eqJ(B.DM.getRefuels(vA).map(r => r.odometer), [11100, 10600, 10000]);

        assert.ok((await A.CS.fullSync()).success);
        eqJ(A.DM.getRefuels(vA).map(r => r.odometer), [11100, 10600, 10000]);
    });

    await test('smazání na A se přenese na B a záznam se nevrátí', async () => {
        const target = A.DM.getRefuels(vA).find(r => r.odometer === 10600);
        A.DM.deleteRefuel(target.id);
        assert.ok((await A.CS.fullSync()).success);
        assert.ok((await B.CS.fullSync()).success);
        eqJ(B.DM.getRefuels(vA).map(r => r.odometer), [11100, 10000]);
        assert.ok((await A.CS.fullSync()).success);
        eqJ(A.DM.getRefuels(vA).map(r => r.odometer), [11100, 10000]);
    });

    await test('úprava záznamu: novější verze vyhraje', async () => {
        const rec = B.DM.getRefuels(vA)[0];
        await new Promise(r => setTimeout(r, 5));
        assert.ok(B.DM.updateRefuel({ ...rec, notes: 'Shell' }));
        assert.ok((await B.CS.fullSync()).success);
        assert.ok((await A.CS.fullSync()).success);
        assert.strictEqual(A.DM.getRefuel(rec.id).notes, 'Shell');
    });

    await test('push se starou revizí je odmítnut (409) a fullSync to vyřeší sloučením', async () => {
        const stale = await A.CS.pushToCloud(0);
        assert.strictEqual(stale.conflict, true);
        const res = await A.CS.fullSync();
        assert.ok(res.success);
    });

    await test('nastavení tmavého režimu a aktivního auta se mezi zařízeními nepřepisuje', async () => {
        A.DM.updateSettings({ darkModeAuto: false, darkMode: true });
        A.DM.updateSettings({ minPrice: 10 });
        assert.ok((await A.CS.fullSync()).success);
        assert.ok((await B.CS.fullSync()).success);
        assert.strictEqual(B.DM.state.settings.darkMode, false);
        assert.strictEqual(B.DM.state.settings.minPrice, 10, 'price limit is shared');
    });

    await test('obnova z neexistujícího ID nezmění ID ani data', async () => {
        const id = B.CS.getUserId();
        const snap = JSON.stringify(B.DM.state);
        const r = await B.CS.restoreFromUserId('fuel_' + '0'.repeat(32));
        assert.strictEqual(r.success, false);
        assert.strictEqual(r.notFound, true);
        assert.strictEqual(B.CS.getUserId(), id);
        assert.strictEqual(JSON.stringify(B.DM.state), snap);
    });

    await test('staré zařízení (data bez updatedAt v cloudu) se sloučí bez ztráty', () => {
        const d = createDevice('legacy', noFetch);
        const v = freshVehicle(d, 'Lokální');
        addRefuel(d, v, '2026-05-01', 5000, 40, 35);
        const res = d.DM.mergeRemote({
            vehicles: [{ id: 'oldcar', name: 'Z cloudu' }],
            refuels: [{ id: 'oldr', vehicleId: 'oldcar', date: '2026-01-01', odometer: 1000, liters: 40, pricePerLiter: 35, totalPrice: 1400, isFullTank: true }],
            settings: {}
        });
        assert.ok(res.ok && res.changed);
        const names = d.DM.getVehicles().map(x => x.name).sort();
        eqJ(names, ['Lokální', 'Z cloudu']);
        assert.strictEqual(d.DM.state.refuels.length, 2);
    });

    // ---------- summary ----------
    const failed = results.filter(r => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} testů prošlo`);
    process.exit(failed.length ? 1 : 0);
})();
