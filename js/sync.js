"use strict";

// === CLOUD SYNC MODULE ===
//
// Rules (v2.8.0):
// - Never push blindly. Every sync = pull -> merge -> push.
// - Merge joins records by id (newer updatedAt wins, deletions are kept as
//   tombstones), so nothing entered on another device or offline is lost.
// - The server stores a revision number. A push based on an old revision is
//   rejected (409) and the client pulls, merges and tries again.
// - Changes made offline are remembered and synced when the device is online.
const CloudSync = {
    // API endpoint (same domain on Cloudflare Pages)
    apiUrl: '/api/sync',

    SYNC_DEBOUNCE_MS: 3000,
    MAX_CONFLICT_RETRIES: 3,

    _syncTimeout: null,
    _syncPromise: null,
    _resyncRequested: false,

    // Called after cloud data changed the local data (app re-renders the view)
    onDataChanged: null,

    // Get or create user ID
    getUserId() {
        let userId = localStorage.getItem('fuelTrackerUserId');
        if (!userId) {
            userId = this.generateUserId();
            localStorage.setItem('fuelTrackerUserId', userId);
        }
        return userId;
    },

    /**
     * The Sync ID is the only key to the cloud data, so it must not be
     * guessable: 128 random bits from the crypto API.
     */
    generateUserId() {
        let hex = '';
        try {
            const bytes = new Uint8Array(16);
            crypto.getRandomValues(bytes);
            hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            for (let i = 0; i < 4; i++) hex += Math.random().toString(16).slice(2, 10);
        }
        return 'fuel_' + hex;
    },

    isValidUserId(id) {
        return typeof id === 'string' && /^fuel_[A-Za-z0-9_-]{8,80}$/.test(id);
    },

    /** Short form for logs - the full ID is a secret */
    maskId(id) {
        if (!id) return '';
        return id.slice(0, 5) + '…' + id.slice(-4);
    },

    // Get last sync time
    getLastSync() {
        return localStorage.getItem('fuelTrackerLastSync');
    },

    // Set last sync time
    setLastSync(time) {
        localStorage.setItem('fuelTrackerLastSync', time);
    },

    // Revision of the cloud data this device has merged last
    getRevision() {
        return Number(localStorage.getItem('fuelTrackerSyncRev')) || 0;
    },

    setRevision(rev) {
        localStorage.setItem('fuelTrackerSyncRev', String(rev || 0));
    },

    // Offline changes waiting for sync
    hasPendingChanges() {
        return localStorage.getItem('fuelTrackerSyncPending') === '1';
    },

    setPending(value) {
        if (value) localStorage.setItem('fuelTrackerSyncPending', '1');
        else localStorage.removeItem('fuelTrackerSyncPending');
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    isEnabled() {
        const settings = DataManager.getSettings();
        return !!(settings && settings.cloudSync);
    },

    /**
     * Debounced sync after a local change. Offline -> remembered for later.
     */
    scheduleSync() {
        this.setPending(true);
        if (!this.isOnline()) {
            Logger.debug('CloudSync', 'Offline - change will be synced later');
            return;
        }
        if (this._syncTimeout) clearTimeout(this._syncTimeout);
        this._syncTimeout = setTimeout(() => {
            this._syncTimeout = null;
            this.fullSync().then(result => {
                if (!result.success) {
                    Logger.warn('CloudSync', 'Auto sync failed', { error: result.error });
                }
            });
        }, this.SYNC_DEBOUNCE_MS);
    },

    async _post(body) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        let result = null;
        try {
            result = await response.json();
        } catch (e) {
            result = { error: `Server vrátil neplatnou odpověď (${response.status})` };
        }
        return { status: response.status, ok: response.ok, result: result || {} };
    },

    /**
     * Push local state. baseRev = revision the local data was merged with.
     * Returns { success, conflict?, lastSync?, rev?, error? }
     */
    async pushToCloud(baseRev) {
        if (!this.isOnline()) {
            return { success: false, error: 'Offline' };
        }

        try {
            const userId = this.getUserId();
            const data = DataManager.exportData();
            data._deviceInfo = navigator.userAgent.substring(0, 50);

            Logger.info('CloudSync', 'Pushing data to cloud', { userId: this.maskId(userId) });

            const { status, result } = await this._post({
                userId,
                data,
                baseRev: typeof baseRev === 'number' ? baseRev : this.getRevision()
            });

            if (status === 409 || result.conflict) {
                Logger.info('CloudSync', 'Push conflict - cloud has newer data', { rev: result.rev });
                return { success: false, conflict: true, error: 'Conflict' };
            }

            if (result.success) {
                this.setLastSync(result.lastSync);
                this.setRevision(result.rev);
                Logger.info('CloudSync', 'Push successful', { lastSync: result.lastSync, rev: result.rev });
                return { success: true, lastSync: result.lastSync, rev: result.rev };
            }

            Logger.error('CloudSync', 'Push failed', { error: result.error, status });
            return { success: false, error: result.error || `HTTP ${status}` };
        } catch (error) {
            Logger.error('CloudSync', 'Push error', { error: error.message });
            return { success: false, error: error.message };
        }
    },

    /**
     * Pull cloud data. userId can be given to read another ID without
     * switching to it first (restore from another device).
     */
    async pullFromCloud(userId) {
        if (!this.isOnline()) {
            return { success: false, error: 'Offline' };
        }

        try {
            const id = userId || this.getUserId();
            Logger.info('CloudSync', 'Pulling data from cloud', { userId: this.maskId(id) });

            const { status, ok, result } = await this._post({ userId: id, action: 'pull' });

            if (!ok) {
                return { success: false, error: result.error || `HTTP ${status}` };
            }

            if (result.data) {
                return {
                    success: true,
                    data: result.data,
                    lastSync: result.lastSync,
                    rev: Number(result.rev) || 0
                };
            }
            return { success: true, data: null, rev: 0, message: 'No cloud data' };
        } catch (error) {
            Logger.error('CloudSync', 'Pull error', { error: error.message });
            return { success: false, error: error.message };
        }
    },

    /**
     * Full sync: pull -> merge -> push (retries on conflict).
     * Only one sync runs at a time; a request during a running sync
     * triggers one more round afterwards.
     */
    fullSync() {
        if (this._syncPromise) {
            this._resyncRequested = true;
            return this._syncPromise;
        }

        this._syncPromise = this._doFullSync()
            .finally(() => {
                this._syncPromise = null;
                if (this._resyncRequested) {
                    this._resyncRequested = false;
                    this.fullSync();
                }
            });
        return this._syncPromise;
    },

    async _doFullSync() {
        if (!this.isOnline()) {
            this.setPending(true);
            return { success: false, error: 'Offline' };
        }

        Logger.info('CloudSync', 'Starting full sync');
        let anyChange = false;

        for (let attempt = 0; attempt <= this.MAX_CONFLICT_RETRIES; attempt++) {
            const pullResult = await this.pullFromCloud();
            if (!pullResult.success) {
                return { success: false, error: pullResult.error };
            }

            if (pullResult.data) {
                const merge = DataManager.mergeRemote(pullResult.data);
                if (!merge.ok) {
                    return { success: false, error: 'Data v cloudu jsou neplatná' };
                }
                if (merge.changed) anyChange = true;
            }

            const pushResult = await this.pushToCloud(pullResult.rev || 0);
            if (pushResult.success) {
                this.setPending(false);
                if (anyChange && typeof this.onDataChanged === 'function') {
                    try { this.onDataChanged(); } catch (e) { /* UI refresh only */ }
                }
                return { success: true, changed: anyChange, lastSync: pushResult.lastSync };
            }
            if (!pushResult.conflict) {
                return { success: false, error: pushResult.error };
            }
            // Conflict: another device pushed in between -> pull & merge again
        }

        return { success: false, error: 'Konflikt synchronizace, zkuste to znovu' };
    },

    /**
     * Restore from another device: read the data for newId first and switch
     * to it only if data exist. Local data are backed up and replaced.
     * Returns { success, error?, notFound? }
     */
    async restoreFromUserId(newId) {
        if (!this.isValidUserId(newId)) {
            return { success: false, error: 'Neplatné Sync ID' };
        }
        const result = await this.pullFromCloud(newId);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        if (!result.data) {
            return { success: false, notFound: true, error: 'Pro toto ID nebyla nalezena žádná data' };
        }

        const cloudData = { ...result.data };
        delete cloudData._lastSync;
        delete cloudData._deviceInfo;
        delete cloudData._rev;

        if (!DataManager.importData(cloudData, { backupReason: 'před obnovou z jiného zařízení' })) {
            return { success: false, error: 'Data v cloudu jsou neplatná' };
        }

        localStorage.setItem('fuelTrackerUserId', newId);
        this.setRevision(result.rev);
        this.setLastSync(result.lastSync || new Date().toISOString());
        this.setPending(false);
        Logger.info('CloudSync', 'Restored from another device', { userId: this.maskId(newId) });
        return { success: true };
    },

    // Get sync status for UI
    getSyncStatus() {
        const lastSync = this.getLastSync();
        const isOnline = this.isOnline();

        return {
            isOnline,
            lastSync,
            pending: this.hasPendingChanges(),
            lastSyncFormatted: lastSync ? new Date(lastSync).toLocaleString('cs-CZ') : 'Nikdy',
            userId: this.getUserId()
        };
    },

    // Copy user ID to clipboard
    async copyUserId() {
        const userId = this.getUserId();
        try {
            await navigator.clipboard.writeText(userId);
            Logger.info('CloudSync', 'User ID copied to clipboard');
            return true;
        } catch (error) {
            Logger.error('CloudSync', 'Failed to copy user ID', { error: error.message });
            return false;
        }
    },

    /**
     * Switch to another Sync ID (e.g. from an imported backup).
     * The next sync merges this device's data with the data under that ID.
     */
    setUserId(newId) {
        if (this.isValidUserId(newId)) {
            localStorage.setItem('fuelTrackerUserId', newId);
            this.setRevision(0);
            Logger.info('CloudSync', 'User ID set', { userId: this.maskId(newId) });
            return true;
        }
        Logger.warn('CloudSync', 'Invalid user ID format');
        return false;
    }
};

// Sync when the user returns to the app (pull + merge first, never a blind push)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    setTimeout(() => {
        if (CloudSync.isEnabled() && CloudSync.isOnline()) {
            CloudSync.fullSync();
        }
    }, 1000);
});

// Back online -> sync, including changes made offline
window.addEventListener('online', () => {
    if (!CloudSync.isEnabled()) return;
    if (typeof showNotification === 'function') {
        showNotification('Online - synchronizuji...', 'cloud_sync');
    }
    CloudSync.fullSync().then(result => {
        if (result.success && typeof showNotification === 'function') {
            showNotification('Data synchronizována', 'cloud_done');
        }
    });
});

window.addEventListener('offline', () => {
    if (typeof showNotification === 'function') {
        showNotification('Offline režim - změny se odešlou po připojení', 'cloud_off');
    }
});

Logger.info('CloudSync', 'Cloud sync module loaded');
