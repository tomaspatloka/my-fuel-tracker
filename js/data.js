"use strict";

const STORAGE_KEY = 'fuelTrackerData';
const BACKUP_PREFIX = 'fuelTrackerBackup_';
const CORRUPTED_PREFIX = 'fuelTrackerData_corrupted_';
const MAX_BACKUPS = 3;
const TOMBSTONE_TTL_MS = 365 * 24 * 60 * 60 * 1000; // deleted IDs are remembered for 1 year

const DEFAULT_SETTINGS = {
    darkMode: false,
    darkModeAuto: true, // Auto detect from system
    notifications: true,
    currency: "Kč",
    activeVehicleId: null,
    minPrice: 15,
    maxPrice: 55,
    cloudSync: false // Cloud synchronization
};

// Settings shared between devices through cloud sync. Everything else
// (dark mode, active car, sync on/off) belongs to the device.
const SHARED_SETTINGS = ['currency', 'minPrice', 'maxPrice'];

const DataManager = {
    DATA_VERSION: '2.8.0', // Current data structure version

    _themeListenerAttached: false,

    // Default State
    state: null,

    _createEmptyState: function () {
        return {
            version: this.DATA_VERSION,
            vehicles: [],
            refuels: [],
            services: [], // Service records (repairs, vignettes, insurance, etc.)
            deleted: {}, // id -> timestamp of deletion (needed for cloud merge)
            sharedSettingsUpdatedAt: 0,
            settings: { ...DEFAULT_SETTINGS }
        };
    },

    /**
     * Turn any stored/imported object into a complete state object.
     * Settings are merged with defaults so new settings always exist.
     */
    _normalizeState: function (raw) {
        const s = this._createEmptyState();
        if (!raw || typeof raw !== 'object') return s;

        s.version = raw.version || '1.0.0';
        s.vehicles = Array.isArray(raw.vehicles) ? raw.vehicles.filter(Boolean).map(v => ({ ...v })) : [];
        s.refuels = Array.isArray(raw.refuels) ? raw.refuels.filter(Boolean).map(r => ({ ...r })) : [];
        s.services = Array.isArray(raw.services) ? raw.services.filter(Boolean).map(x => ({ ...x })) : [];
        s.deleted = (raw.deleted && typeof raw.deleted === 'object' && !Array.isArray(raw.deleted))
            ? { ...raw.deleted } : {};
        s.sharedSettingsUpdatedAt = Number(raw.sharedSettingsUpdatedAt) || 0;
        const rawSettings = (raw.settings && typeof raw.settings === 'object') ? raw.settings : {};
        s.settings = { ...DEFAULT_SETTINGS, ...rawSettings };
        return s;
    },

    // Load data from LocalStorage
    init: function () {
        try {
            Logger.info('DataManager', 'Initializing data manager');
            this.state = this._createEmptyState();

            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                let parsed = null;
                try {
                    parsed = JSON.parse(saved);
                    if (!parsed || typeof parsed !== 'object') {
                        throw new Error('Stored data is not an object');
                    }
                } catch (e) {
                    Logger.error('DataManager', 'Failed to parse saved data', {
                        error: e.message
                    });

                    // Keep the broken data so it can be recovered manually
                    this._backupCorruptedData(saved);
                    this.seedInitialData();

                    if (typeof showNotification === 'function') {
                        showNotification('Data byla poškozená, obnovena výchozí data (původní jsou zazálohovaná)');
                    }
                    this.applySettings();
                    return;
                }

                this.state = this._normalizeState(parsed);
                this._migrateData(parsed);
                this._validateDataIntegrity({ backup: true });

                Logger.info('DataManager', 'Data loaded successfully', {
                    vehiclesCount: this.state.vehicles.length,
                    refuelsCount: this.state.refuels.length
                });
            } else {
                Logger.info('DataManager', 'No saved data found, seeding initial data');
                this.seedInitialData();
            }

            this.applySettings();
            this._requestPersistentStorage();
        } catch (e) {
            Logger.fatal('DataManager', 'Critical error during initialization', {
                error: e.message,
                stack: e.stack
            });

            // Last resort - use completely fresh state (nothing is saved over the stored data)
            this.state = this._createEmptyState();
        }
    },

    /**
     * Ask the browser not to evict our data (iOS/Safari may delete site data
     * after 7 days without use otherwise).
     */
    _requestPersistentStorage: function () {
        try {
            if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
                navigator.storage.persisted().then(isPersisted => {
                    if (isPersisted) return true;
                    return navigator.storage.persist();
                }).then(granted => {
                    Logger.info('DataManager', 'Persistent storage', { granted: !!granted });
                }).catch(() => { /* not critical */ });
            }
        } catch (e) {
            // not critical
        }
    },

    /**
     * Validate data integrity: coerce numbers, drop broken records,
     * remove orphans and apply deletions.
     */
    _validateDataIntegrity: function (opts = {}) {
        const issues = [];
        const num = v => (typeof v === 'number' ? v : parseFloat(v));
        const now = Date.now();

        // Prune old tombstones
        Object.keys(this.state.deleted).forEach(id => {
            const ts = Number(this.state.deleted[id]);
            if (!ts || now - ts > TOMBSTONE_TTL_MS) delete this.state.deleted[id];
        });
        const isDeleted = rec => {
            const ts = this.state.deleted[rec.id];
            return ts && ts >= (rec.updatedAt || 0);
        };

        const cleanVehicles = this.state.vehicles.filter(v => {
            if (!v || !isSafeId(v.id) || !v.name) {
                issues.push({ kind: 'vehicle', record: v });
                return false;
            }
            return !isDeleted(v);
        });

        const vehicleIds = new Set(cleanVehicles.map(v => v.id));

        const cleanRefuels = [];
        this.state.refuels.forEach(r => {
            if (!r) return;
            const rec = { ...r };
            rec.odometer = num(rec.odometer);
            rec.liters = num(rec.liters);
            rec.pricePerLiter = num(rec.pricePerLiter);
            rec.totalPrice = num(rec.totalPrice);
            if (!isFinite(rec.totalPrice) && isFinite(rec.liters) && isFinite(rec.pricePerLiter)) {
                rec.totalPrice = Math.round(rec.liters * rec.pricePerLiter * 100) / 100;
            }
            rec.isFullTank = !!rec.isFullTank;
            rec.missedPrevious = !!rec.missedPrevious;
            rec.date = DateUtil.normalize(rec.date);

            const valid = isSafeId(rec.id) && isSafeId(rec.vehicleId) && rec.date &&
                isFinite(rec.odometer) && rec.odometer > 0 &&
                isFinite(rec.liters) && rec.liters > 0 &&
                isFinite(rec.pricePerLiter) && isFinite(rec.totalPrice);

            if (!valid) {
                issues.push({ kind: 'refuel', record: r });
                return;
            }
            if (!vehicleIds.has(rec.vehicleId)) {
                issues.push({ kind: 'orphan refuel', record: r });
                return;
            }
            if (isDeleted(rec)) return;
            cleanRefuels.push(rec);
        });

        const cleanServices = [];
        this.state.services.forEach(s => {
            if (!s) return;
            const rec = { ...s };
            rec.date = DateUtil.normalize(rec.date);
            rec.validUntil = rec.validUntil ? DateUtil.normalize(rec.validUntil) : null;
            rec.cost = isFinite(num(rec.cost)) ? num(rec.cost) : 0;
            rec.odometer = isFinite(num(rec.odometer)) ? num(rec.odometer) : null;
            rec.nextOdometer = isFinite(num(rec.nextOdometer)) ? num(rec.nextOdometer) : null;

            if (!isSafeId(rec.id) || !isSafeId(rec.vehicleId) || !rec.date) {
                issues.push({ kind: 'service', record: s });
                return;
            }
            if (!vehicleIds.has(rec.vehicleId)) {
                issues.push({ kind: 'orphan service', record: s });
                return;
            }
            if (isDeleted(rec)) return;
            cleanServices.push(rec);
        });

        if (issues.length > 0) {
            Logger.warn('DataManager', 'Data integrity issues found and fixed', {
                issuesCount: issues.length,
                kinds: issues.map(i => i.kind)
            });
            // Keep a copy of the original data before anything is removed
            if (opts.backup) this.createBackup('před opravou dat');
        }

        this.state.vehicles = cleanVehicles;
        this.state.refuels = cleanRefuels;
        this.state.services = cleanServices;

        // Active vehicle must exist
        if (!this.getVehicle(this.state.settings.activeVehicleId)) {
            this.state.settings.activeVehicleId = cleanVehicles.length > 0 ? cleanVehicles[0].id : null;
        }

        if (issues.length > 0) {
            this.save({ skipCloud: true });
        }
        return issues.length;
    },

    /**
     * Migrate data between versions
     */
    _migrateData: function (oldData, opts = {}) {
        const oldVersion = (oldData && oldData.version) || '1.0.0';
        const currentVersion = this.DATA_VERSION;

        if (oldVersion === currentVersion) {
            Logger.debug('DataManager', 'No migration needed', { version: currentVersion });
            return;
        }

        Logger.info('DataManager', 'Starting data migration', {
            from: oldVersion,
            to: currentVersion
        });

        try {
            if (opts.backup !== false) {
                this.createBackup(`před migrací z verze ${oldVersion}`);
            }

            // Missing settings (darkModeAuto, minPrice, cloudSync, ...) are filled
            // from DEFAULT_SETTINGS by _normalizeState.

            // Migration to v2.4.0 - price limits are now editable in Settings
            // Old builds had 25-45 Kc/l hardwired with no UI, so premium fuel and LPG
            // could not be entered at all. Widen that one case to the new default.
            if (this.state.settings.minPrice === 25 && this.state.settings.maxPrice === 45) {
                this.state.settings.minPrice = 15;
                this.state.settings.maxPrice = 55;
                Logger.info('DataManager', 'Widened price limits to new default');
            }

            // Migration to v2.8.0 - records get updatedAt (0 = unknown) and
            // the state gets a list of deletions for cloud merging.
            // Both are handled by defaults: missing updatedAt counts as 0.

            this.state.version = this.DATA_VERSION;
            this.save({ skipCloud: true });

            Logger.info('DataManager', 'Migration completed successfully', {
                newVersion: this.DATA_VERSION
            });

            if (opts.notify !== false && typeof showNotification === 'function') {
                showNotification('Data aktualizována na novou verzi');
            }
        } catch (e) {
            Logger.error('DataManager', 'Migration failed', {
                error: e.message,
                stack: e.stack,
                oldVersion,
                currentVersion
            });
        }
    },

    /**
     * Backup corrupted data for recovery
     */
    _backupCorruptedData: function (corruptedData) {
        try {
            const timestamp = Date.now();
            localStorage.setItem(CORRUPTED_PREFIX + timestamp, corruptedData);
            Logger.info('DataManager', 'Corrupted data backed up', { timestamp });
        } catch (e) {
            Logger.error('DataManager', 'Failed to backup corrupted data', {
                error: e.message
            });
        }
    },

    seedInitialData: function () {
        // Create a default car so the user sees something
        this.state = this._createEmptyState();
        const defaultCarId = this.generateId();
        this.state.vehicles.push({
            id: defaultCarId,
            name: "Vzorové Auto",
            manufacturer: "Škoda",
            type: "Octavia",
            engine: "2.0 TDI",
            tankSize: 50,
            isDefault: true,
            isSample: true,
            updatedAt: 0
        });
        this.state.settings.activeVehicleId = defaultCarId;
        this.save({ skipCloud: true });
    },

    // --- Storage ---

    _localStorageKeys: function () {
        const keys = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
        } catch (e) {
            // ignore
        }
        return keys;
    },

    _isQuotaError: function (e) {
        return !!e && (e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            e.code === 22 || e.code === 1014);
    },

    /**
     * Free space when storage is full. Removes error logs and older automatic
     * backups. Corrupted-data backups are never removed automatically -
     * they may be the only copy of the user's data.
     */
    _freeSpace: function () {
        try {
            localStorage.removeItem('fuelTrackerErrors');
            const backups = this.listBackups();
            backups.slice(1).forEach(b => localStorage.removeItem(b.key));
            Logger.warn('DataManager', 'Freed storage space', { removedBackups: Math.max(0, backups.length - 1) });
        } catch (e) {
            Logger.error('DataManager', 'Failed to free space', { error: e.message });
        }
    },

    /**
     * Save state to localStorage.
     * opts.skipCloud - don't schedule cloud sync (device-only changes, merges)
     */
    save: function (opts = {}) {
        let dataStr;
        try {
            dataStr = JSON.stringify(this.state);
        } catch (e) {
            Logger.error('DataManager', 'Failed to serialize data', { error: e.message });
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEY, dataStr);
        } catch (err) {
            if (this._isQuotaError(err)) {
                Logger.error('DataManager', 'Storage quota exceeded', { dataSize: dataStr.length });
                this._freeSpace();
                try {
                    localStorage.setItem(STORAGE_KEY, dataStr);
                } catch (err2) {
                    Logger.error('DataManager', 'Save failed even after freeing space', { error: err2.message });
                    if (typeof showNotification === 'function') {
                        showNotification('Úložiště je plné! Exportujte data a smažte staré záznamy.');
                    }
                    return false;
                }
            } else {
                Logger.error('DataManager', 'Failed to save data', { error: err.message });
                if (typeof showNotification === 'function') {
                    showNotification('Chyba při ukládání dat!');
                }
                return false;
            }
        }

        Logger.debug('DataManager', 'Data saved successfully', { dataSize: dataStr.length });

        if (!opts.skipCloud) {
            this._scheduleCloudPush();
        }
        return true;
    },

    /**
     * Ask CloudSync for a (debounced) sync after a change.
     * CloudSync always pulls and merges before it pushes.
     */
    _scheduleCloudPush: function () {
        if (!this.state.settings.cloudSync || typeof CloudSync === 'undefined') {
            return;
        }
        CloudSync.scheduleSync();
    },

    // --- Backups (kept in localStorage, newest MAX_BACKUPS) ---

    createBackup: function (reason) {
        try {
            let createdAt = Date.now();
            // Two backups in the same millisecond must not overwrite each other
            while (localStorage.getItem(BACKUP_PREFIX + createdAt) !== null) createdAt++;
            const key = BACKUP_PREFIX + createdAt;
            localStorage.setItem(key, JSON.stringify({
                reason: reason || 'záloha',
                createdAt: new Date(createdAt).toISOString(),
                data: this.state
            }));
            this._pruneBackups(MAX_BACKUPS);
            Logger.info('DataManager', 'Backup created', { key, reason });
            return key;
        } catch (e) {
            Logger.warn('DataManager', 'Backup failed', { error: e.message });
            return null;
        }
    },

    listBackups: function () {
        return this._localStorageKeys()
            .filter(k => k && k.startsWith(BACKUP_PREFIX))
            .map(key => {
                try {
                    const parsed = JSON.parse(localStorage.getItem(key));
                    const data = (parsed && parsed.data) || {};
                    return {
                        key,
                        reason: parsed.reason || '',
                        createdAt: parsed.createdAt || null,
                        vehiclesCount: Array.isArray(data.vehicles) ? data.vehicles.length : 0,
                        refuelsCount: Array.isArray(data.refuels) ? data.refuels.length : 0
                    };
                } catch (e) {
                    return { key, reason: 'poškozená záloha', createdAt: null, vehiclesCount: 0, refuelsCount: 0 };
                }
            })
            .sort((a, b) => Number(b.key.slice(BACKUP_PREFIX.length)) - Number(a.key.slice(BACKUP_PREFIX.length)));
    },

    _pruneBackups: function (keep) {
        this.listBackups().slice(keep).forEach(b => {
            try { localStorage.removeItem(b.key); } catch (e) { /* ignore */ }
        });
    },

    restoreBackup: function (key) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key));
            if (!parsed || !parsed.data) return false;
            // importData makes a backup of the current state first
            return this.importData(parsed.data, { backupReason: 'před obnovou ze zálohy' });
        } catch (e) {
            Logger.error('DataManager', 'Restore backup failed', { error: e.message });
            return false;
        }
    },

    applySettings: function () {
        let shouldUseDarkMode = this.state.settings.darkMode;

        // Auto dark mode - check system preference
        if (this.state.settings.darkModeAuto) {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            shouldUseDarkMode = !!prefersDark;
        }

        if (shouldUseDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Listen for system theme changes - attach only ONCE
        // (previously every call added another listener)
        if (!this._themeListenerAttached && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e) => {
                if (this.state.settings.darkModeAuto) {
                    Logger.info('Settings', 'System theme changed', { isDark: e.matches });
                    this.applySettings();
                }
            };
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handler);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(handler);
            }
            this._themeListenerAttached = true;
        }
    },

    // --- Record helpers ---

    _touch: function (record) {
        record.updatedAt = Date.now();
        return record;
    },

    _markDeleted: function (id) {
        if (id) this.state.deleted[id] = Date.now();
    },

    // --- Vehicle Methods ---
    getVehicles: function () {
        return this.state.vehicles;
    },

    getVehicle: function (id) {
        if (!id) return undefined;
        return this.state.vehicles.find(v => v.id === id);
    },

    getActiveVehicle: function () {
        const active = this.getVehicle(this.state.settings.activeVehicleId);
        if (active) return active;
        return this.state.vehicles.length > 0 ? this.state.vehicles[0] : null;
    },

    saveVehicle: function (vehicleData) {
        if (vehicleData.id) {
            // Update
            const index = this.state.vehicles.findIndex(v => v.id === vehicleData.id);
            if (index !== -1) {
                const updated = { ...this.state.vehicles[index], ...vehicleData };
                delete updated.isSample; // user edited it - it's a real car now
                this.state.vehicles[index] = this._touch(updated);
            }
        } else {
            // Create
            vehicleData.id = this.generateId();
            this._touch(vehicleData);
            this.state.vehicles.push(vehicleData);
            // If first car, make active
            if (this.state.vehicles.length === 1) {
                this.state.settings.activeVehicleId = vehicleData.id;
            }
        }
        this.save();
        return vehicleData.id;
    },

    deleteVehicle: function (id) {
        this._markDeleted(id);
        this.state.refuels.filter(r => r.vehicleId === id).forEach(r => this._markDeleted(r.id));
        this.state.services.filter(s => s.vehicleId === id).forEach(s => this._markDeleted(s.id));

        this.state.vehicles = this.state.vehicles.filter(v => v.id !== id);
        this.state.refuels = this.state.refuels.filter(r => r.vehicleId !== id);
        this.state.services = this.state.services.filter(s => s.vehicleId !== id);

        if (this.state.settings.activeVehicleId === id) {
            this.state.settings.activeVehicleId = this.state.vehicles.length > 0 ? this.state.vehicles[0].id : null;
        }
        this.save();
    },

    setActiveVehicle: function (id) {
        this.state.settings.activeVehicleId = id;
        this.save({ skipCloud: true }); // device-only setting
    },

    // --- Refuel Methods ---

    /**
     * Refuels of a vehicle, newest first.
     * Sorted by ODOMETER - the only reliable order when there are more
     * refuels on the same day (date is a tie-breaker only).
     */
    getRefuels: function (vehicleId) {
        return this.state.refuels
            .filter(r => r.vehicleId === vehicleId)
            .sort((a, b) => (b.odometer - a.odometer) || String(b.date).localeCompare(String(a.date)));
    },

    getRefuel: function (id) {
        return this.state.refuels.find(r => r.id === id);
    },

    addRefuel: function (refuelData) {
        try {
            const validation = this._validateRefuelData(refuelData);
            if (!validation.valid) {
                Logger.warn('DataManager', 'Invalid refuel data', { errors: validation.errors });

                if (typeof showNotification === 'function') {
                    showNotification(validation.errors[0] || 'Neplatná data tankování');
                }
                return null;
            }

            const record = { ...refuelData, id: this.generateId() };
            this._touch(record);
            this.state.refuels.push(record);
            this.save();

            Logger.info('DataManager', 'Refuel added successfully', {
                refuelId: record.id,
                vehicleId: record.vehicleId
            });

            return record;
        } catch (e) {
            Logger.error('DataManager', 'Failed to add refuel', {
                error: e.message,
                stack: e.stack
            });
            return null;
        }
    },

    /**
     * Validate refuel data
     */
    _validateRefuelData: function (data) {
        const errors = [];

        const required = ErrorHandler.validateRequired(
            ['vehicleId', 'date', 'odometer', 'liters', 'pricePerLiter', 'totalPrice'],
            data
        );
        if (!required.valid) {
            errors.push(`Chybí povinná pole: ${required.missing.join(', ')}`);
        }

        const checks = [
            ErrorHandler.validateRange(data.odometer, 1, 9999999, 'Stav tachometru'),
            ErrorHandler.validateRange(data.liters, 0.01, 1000, 'Natankované litry'),
            ErrorHandler.validateRange(data.pricePerLiter, 0.01, 1000, 'Cena za litr'),
            ErrorHandler.validateRange(data.totalPrice, 0.01, 100000, 'Celková cena'),
            ErrorHandler.validateDate(data.date, 'Datum')
        ];
        checks.forEach(c => {
            if (!c.valid) errors.push(c.error);
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    updateRefuel: function (refuelData) {
        try {
            const validation = this._validateRefuelData(refuelData);
            if (!validation.valid) {
                Logger.warn('DataManager', 'Invalid refuel data for update', { errors: validation.errors });

                if (typeof showNotification === 'function') {
                    showNotification(validation.errors[0] || 'Neplatná data tankování');
                }
                return false;
            }

            const index = this.state.refuels.findIndex(r => r.id === refuelData.id);
            if (index !== -1) {
                this.state.refuels[index] = this._touch({ ...this.state.refuels[index], ...refuelData });
                this.save();
                Logger.info('DataManager', 'Refuel updated successfully', { refuelId: refuelData.id });
                return true;
            }

            Logger.warn('DataManager', 'Refuel not found for update', { refuelId: refuelData.id });
            return false;
        } catch (e) {
            Logger.error('DataManager', 'Failed to update refuel', {
                error: e.message,
                stack: e.stack
            });
            return false;
        }
    },

    deleteRefuel: function (id) {
        try {
            const beforeCount = this.state.refuels.length;
            this.state.refuels = this.state.refuels.filter(r => r.id !== id);

            if (beforeCount === this.state.refuels.length) {
                Logger.warn('DataManager', 'Refuel not found for deletion', { refuelId: id });
                return false;
            }

            this._markDeleted(id);
            this.save();

            Logger.info('DataManager', 'Refuel deleted successfully', { refuelId: id });
            return true;
        } catch (e) {
            Logger.error('DataManager', 'Failed to delete refuel', {
                error: e.message,
                refuelId: id
            });
            return false;
        }
    },

    // --- Consumption (ONE algorithm used by dashboard, list, stats and CSV) ---

    /**
     * Split refuels into full-tank-to-full-tank segments.
     *
     * - Consumption = all liters refueled after full tank A up to and including
     *   full tank B, divided by the distance A -> B.
     * - Partial refuels are accumulated into the next full tank.
     * - A refuel marked "missedPrevious" (the driver forgot to log one) breaks
     *   the segment - the missing liters would make the result wrong.
     * - Segments with unrealistic consumption (outside 1-50 l/100km, usually an
     *   odometer typo) are marked invalid and excluded from all statistics.
     */
    _buildSegments: function (vehicleId) {
        const logs = this.getRefuels(vehicleId).slice().reverse(); // oldest first
        const segments = [];
        let startIdx = -1;

        for (let i = 0; i < logs.length; i++) {
            const r = logs[i];

            if (r.missedPrevious) {
                startIdx = r.isFullTank ? i : -1;
                continue;
            }
            if (!r.isFullTank) continue;
            if (startIdx === -1) {
                startIdx = i;
                continue;
            }

            const start = logs[startIdx];
            const distance = r.odometer - start.odometer;
            let liters = 0;
            let cost = 0;
            const refuelIds = [];
            for (let j = startIdx + 1; j <= i; j++) {
                liters += Number(logs[j].liters) || 0;
                cost += Number(logs[j].totalPrice) || 0;
                refuelIds.push(logs[j].id);
            }

            const consumption = distance > 0 ? (liters / distance) * 100 : NaN;
            const valid = distance > 0 && liters > 0 && consumption >= 1 && consumption <= 50;

            if (!valid) {
                Logger.warn('DataManager', 'Unrealistic consumption segment ignored', {
                    from: start.odometer,
                    to: r.odometer,
                    liters
                });
            }

            segments.push({
                refuelIds,
                date: r.date,
                fromOdometer: start.odometer,
                toOdometer: r.odometer,
                distance,
                liters,
                cost,
                consumption: valid ? consumption : null,
                valid
            });
            startIdx = i;
        }

        return { logs, segments };
    },

    /**
     * Consumption per refuel record: { refuelId: number | null }
     * Every refuel in a valid segment gets that segment's consumption.
     */
    calculateConsumptionForRefuels: function (vehicleId) {
        try {
            const { logs, segments } = this._buildSegments(vehicleId);
            const map = {};
            logs.forEach(l => { map[l.id] = null; });
            segments.filter(s => s.valid).forEach(s => {
                const value = Math.round(s.consumption * 10) / 10;
                s.refuelIds.forEach(id => { map[id] = value; });
            });
            return map;
        } catch (e) {
            Logger.error('DataManager', 'Failed to calculate consumption for refuels', {
                error: e.message,
                vehicleId
            });
            return {};
        }
    },

    // --- Stats Helpers ---
    calculateStats: function (vehicleId) {
        try {
            const { logs, segments } = this._buildSegments(vehicleId);
            if (logs.length === 0) return null;

            const valid = segments.filter(s => s.valid);

            let totalDist = 0;
            let totalLiters = 0;
            let segmentCost = 0;
            let minCons = Infinity;
            let maxCons = -Infinity;

            const seasonal = {
                spring: { dist: 0, liters: 0, cost: 0 },
                summer: { dist: 0, liters: 0, cost: 0 },
                autumn: { dist: 0, liters: 0, cost: 0 },
                winter: { dist: 0, liters: 0, cost: 0 }
            };

            valid.forEach(s => {
                totalDist += s.distance;
                totalLiters += s.liters;
                segmentCost += s.cost;
                if (s.consumption < minCons) minCons = s.consumption;
                if (s.consumption > maxCons) maxCons = s.consumption;

                const month = DateUtil.month(s.date);
                let season = 'winter';
                if (month >= 3 && month <= 5) season = 'spring';
                else if (month >= 6 && month <= 8) season = 'summer';
                else if (month >= 9 && month <= 11) season = 'autumn';

                seasonal[season].dist += s.distance;
                seasonal[season].liters += s.liters;
                seasonal[season].cost += s.cost;
            });

            // Everything ever paid for fuel (including the first refuel)
            const totalSpent = logs.reduce((sum, l) => sum + (Number(l.totalPrice) || 0), 0);
            const distanceDriven = logs.length > 1 ? logs[logs.length - 1].odometer - logs[0].odometer : 0;
            const hasConsumption = valid.length > 0 && totalDist > 0;

            const stats = {
                hasConsumption,
                avgCons: hasConsumption ? ((totalLiters / totalDist) * 100).toFixed(1) : null,
                minCons: hasConsumption ? minCons.toFixed(1) : null,
                maxCons: hasConsumption ? maxCons.toFixed(1) : null,
                // Fuel cost per km from measured segments (real fuel burned per km)
                costPerKm: hasConsumption ? (segmentCost / totalDist).toFixed(2) : null,
                totalCost: totalSpent,
                totalSpent,
                distanceDriven,
                seasonal,
                consumptions: valid.map(s => ({ date: s.date, value: Math.round(s.consumption * 10) / 10 })),
                lastRefuel: logs[logs.length - 1]
            };

            Logger.debug('DataManager', 'Stats calculated successfully', {
                vehicleId,
                avgCons: stats.avgCons
            });

            return stats;
        } catch (e) {
            Logger.error('DataManager', 'Failed to calculate stats', {
                error: e.message,
                stack: e.stack,
                vehicleId
            });
            return null;
        }
    },

    /**
     * Highest known odometer of a vehicle (refuels and service records)
     */
    getCurrentOdometer: function (vehicleId) {
        let max = 0;
        this.state.refuels.forEach(r => {
            if (r.vehicleId === vehicleId && r.odometer > max) max = r.odometer;
        });
        this.state.services.forEach(s => {
            if (s.vehicleId === vehicleId && s.odometer > max) max = s.odometer;
        });
        return max;
    },

    // --- Service Records Methods ---
    getServices: function (vehicleId) {
        return this.state.services
            .filter(s => s.vehicleId === vehicleId)
            .sort((a, b) => String(b.date).localeCompare(String(a.date))); // Newest first
    },

    getService: function (id) {
        return this.state.services.find(s => s.id === id);
    },

    addService: function (serviceData) {
        try {
            const record = { ...serviceData, id: this.generateId() };
            this._touch(record);
            this.state.services.push(record);
            this.save();

            Logger.info('DataManager', 'Service record added', {
                serviceId: record.id,
                type: record.type
            });

            return record;
        } catch (e) {
            Logger.error('DataManager', 'Failed to add service record', { error: e.message });
            return null;
        }
    },

    updateService: function (serviceData) {
        try {
            const index = this.state.services.findIndex(s => s.id === serviceData.id);
            if (index !== -1) {
                this.state.services[index] = this._touch({ ...this.state.services[index], ...serviceData });
                this.save();
                Logger.info('DataManager', 'Service record updated', { serviceId: serviceData.id });
                return true;
            }
            return false;
        } catch (e) {
            Logger.error('DataManager', 'Failed to update service record', { error: e.message });
            return false;
        }
    },

    deleteService: function (id) {
        try {
            const beforeCount = this.state.services.length;
            this.state.services = this.state.services.filter(s => s.id !== id);

            if (this.state.services.length < beforeCount) {
                this._markDeleted(id);
                this.save();
                Logger.info('DataManager', 'Service record deleted', { serviceId: id });
                return true;
            }
            return false;
        } catch (e) {
            Logger.error('DataManager', 'Failed to delete service record', { error: e.message });
            return false;
        }
    },

    /**
     * For each type with a validity (vignette, insurance, inspection) only the
     * record with the LATEST validUntil matters. An old vignette is no longer
     * "expired" once a new one has been bought.
     */
    _latestValidityPerType: function (vehicleId) {
        const latest = {};
        this.state.services.forEach(s => {
            if (s.vehicleId !== vehicleId || !s.validUntil) return;
            const type = s.type || 'other';
            if (!latest[type] || s.validUntil > latest[type].validUntil) {
                latest[type] = s;
            }
        });
        return Object.values(latest);
    },

    // Get services expiring soon (validUntil is the LAST valid day, inclusive)
    getExpiringServices: function (vehicleId, daysAhead = 30) {
        const today = DateUtil.today();
        const limit = DateUtil.addDays(today, daysAhead);
        return this._latestValidityPerType(vehicleId)
            .filter(s => s.validUntil >= today && s.validUntil <= limit)
            .sort((a, b) => a.validUntil.localeCompare(b.validUntil));
    },

    // Get expired services (validity ended before today)
    getExpiredServices: function (vehicleId) {
        const today = DateUtil.today();
        return this._latestValidityPerType(vehicleId)
            .filter(s => s.validUntil < today)
            .sort((a, b) => b.validUntil.localeCompare(a.validUntil));
    },

    isServiceExpired: function (service) {
        return !!service.validUntil && service.validUntil < DateUtil.today();
    },

    /**
     * Services due by odometer (e.g. oil change at 150 000 km).
     * Only the newest record with "nextOdometer" per type counts.
     * Returns [{ service, remainingKm }] for those within warnKm (or overdue).
     */
    getServicesDueByKm: function (vehicleId, warnKm = 1000) {
        const currentOdo = this.getCurrentOdometer(vehicleId);
        if (!currentOdo) return [];

        const latest = {};
        this.state.services.forEach(s => {
            if (s.vehicleId !== vehicleId || !s.nextOdometer) return;
            const type = s.type || 'other';
            const cur = latest[type];
            if (!cur || s.date > cur.date || (s.date === cur.date && (s.odometer || 0) > (cur.odometer || 0))) {
                latest[type] = s;
            }
        });

        return Object.values(latest)
            .map(s => ({ service: s, remainingKm: s.nextOdometer - currentOdo }))
            .filter(x => x.remainingKm <= warnKm)
            .sort((a, b) => a.remainingKm - b.remainingKm);
    },

    // Calculate total service costs for a vehicle
    calculateServiceCosts: function (vehicleId) {
        const services = this.state.services.filter(s => s.vehicleId === vehicleId);

        let totalCost = 0;
        const byType = {
            service: 0,
            vignette: 0,
            insurance: 0,
            inspection: 0,
            other: 0
        };

        services.forEach(s => {
            const cost = parseFloat(s.cost) || 0;
            totalCost += cost;
            if (Object.prototype.hasOwnProperty.call(byType, s.type)) {
                byType[s.type] += cost;
            } else {
                byType.other += cost;
            }
        });

        return {
            total: totalCost,
            byType,
            count: services.length
        };
    },

    // --- Helpers ---
    generateId: function () {
        let rand = '';
        try {
            const arr = new Uint32Array(2);
            crypto.getRandomValues(arr);
            rand = arr[0].toString(36) + arr[1].toString(36);
        } catch (e) {
            rand = Math.random().toString(36).slice(2);
        }
        return Date.now().toString(36) + rand;
    },

    // --- Settings Methods ---
    getSettings: function () {
        return this.state.settings;
    },

    updateSettings: function (newSettings) {
        const sharedChanged = SHARED_SETTINGS.some(k =>
            Object.prototype.hasOwnProperty.call(newSettings, k) && newSettings[k] !== this.state.settings[k]);

        this.state.settings = { ...this.state.settings, ...newSettings };
        if (sharedChanged) {
            this.state.sharedSettingsUpdatedAt = Date.now();
        }
        // Only shared settings need to go to the cloud
        this.save({ skipCloud: !sharedChanged });
        this.applySettings();
        Logger.info('DataManager', 'Settings updated', newSettings);
    },

    // --- Export/Import ---
    exportData: function () {
        return JSON.parse(JSON.stringify(this.state));
    },

    /**
     * Replace local data with imported data (JSON import, backup restore,
     * restore from another device). A backup of the current data is made first.
     * opts.backup = false skips the backup, opts.backupReason labels it.
     */
    importData: function (data, opts = {}) {
        try {
            if (!data || typeof data !== 'object') {
                Logger.error('DataManager', 'Invalid import data');
                return false;
            }
            if (!Array.isArray(data.vehicles) || !Array.isArray(data.refuels)) {
                Logger.error('DataManager', 'Invalid data structure');
                return false;
            }

            if (opts.backup !== false) {
                this.createBackup(opts.backupReason || 'před importem');
            }

            const localSettings = this.state.settings;
            const next = this._normalizeState(data);
            // Cloud sync on/off is a decision of this device, not of the file
            next.settings.cloudSync = localSettings.cloudSync;

            this.state = next;
            this._migrateData(data, { backup: false, notify: false });
            this._validateDataIntegrity();
            this.state.version = this.DATA_VERSION;
            this.save({ skipCloud: true });
            this.applySettings();

            Logger.info('DataManager', 'Data imported successfully', {
                vehiclesCount: this.state.vehicles.length,
                refuelsCount: this.state.refuels.length
            });

            return true;
        } catch (e) {
            Logger.error('DataManager', 'Import failed', {
                error: e.message,
                stack: e.stack
            });
            return false;
        }
    },

    /**
     * Merge data from the cloud into local data (used by cloud sync).
     * Nothing is thrown away: records are joined by id, the newer version
     * (updatedAt) wins and deletions are respected via tombstones.
     * Returns { ok, changed }.
     */
    mergeRemote: function (remote) {
        try {
            if (!remote || typeof remote !== 'object' ||
                !Array.isArray(remote.vehicles) || !Array.isArray(remote.refuels)) {
                return { ok: false, changed: false };
            }

            const r = this._normalizeState(remote);
            const snapshot = () => JSON.stringify([
                this.state.vehicles, this.state.refuels, this.state.services, this.state.deleted,
                SHARED_SETTINGS.map(k => this.state.settings[k])
            ]);
            const before = snapshot();

            // Union of deletions (newest timestamp wins)
            const deleted = { ...this.state.deleted };
            Object.keys(r.deleted).forEach(id => {
                const ts = Number(r.deleted[id]) || 0;
                if (!deleted[id] || ts > deleted[id]) deleted[id] = ts;
            });

            const mergeList = (localList, remoteList) => {
                const map = new Map();
                localList.forEach(x => map.set(x.id, x));
                remoteList.forEach(x => {
                    if (!x || !x.id) return;
                    const cur = map.get(x.id);
                    if (!cur || (Number(x.updatedAt) || 0) > (Number(cur.updatedAt) || 0)) {
                        map.set(x.id, x);
                    }
                });
                return Array.from(map.values())
                    .filter(x => !(deleted[x.id] && deleted[x.id] >= (Number(x.updatedAt) || 0)));
            };

            // The untouched sample car of a fresh device should not spread to the cloud
            let localVehicles = this.state.vehicles;
            if (r.vehicles.length > 0) {
                localVehicles = localVehicles.filter(v => !(v.isSample &&
                    !this.state.refuels.some(x => x.vehicleId === v.id) &&
                    !this.state.services.some(x => x.vehicleId === v.id)));
            }

            this.state.deleted = deleted;
            this.state.vehicles = mergeList(localVehicles, r.vehicles);
            this.state.refuels = mergeList(this.state.refuels, r.refuels);
            this.state.services = mergeList(this.state.services, r.services);

            if (r.sharedSettingsUpdatedAt > (this.state.sharedSettingsUpdatedAt || 0)) {
                SHARED_SETTINGS.forEach(k => {
                    if (r.settings[k] !== undefined) this.state.settings[k] = r.settings[k];
                });
                this.state.sharedSettingsUpdatedAt = r.sharedSettingsUpdatedAt;
            }

            this._validateDataIntegrity();

            const changed = before !== snapshot();
            if (changed) {
                this.save({ skipCloud: true });
                this.applySettings();
            }
            Logger.info('DataManager', 'Cloud data merged', { changed });
            return { ok: true, changed };
        } catch (e) {
            Logger.error('DataManager', 'Merge failed', { error: e.message, stack: e.stack });
            return { ok: false, changed: false };
        }
    }
};

// Initial state (replaced in init)
DataManager.state = DataManager._createEmptyState();
