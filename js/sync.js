"use strict";

// === CLOUD SYNC MODULE ===
const CloudSync = {
    // API endpoint (same domain on Cloudflare Pages)
    apiUrl: '/api/sync',

    // Get or create user ID
    getUserId() {
        let userId = localStorage.getItem('fuelTrackerUserId');
        if (!userId) {
            userId = 'fuel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('fuelTrackerUserId', userId);
        }
        return userId;
    },

    // Get last sync time
    getLastSync() {
        return localStorage.getItem('fuelTrackerLastSync');
    },

    // Set last sync time
    setLastSync(time) {
        localStorage.setItem('fuelTrackerLastSync', time);
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    // Sync data to cloud
    async pushToCloud() {
        if (!this.isOnline()) {
            Logger.warn('CloudSync', 'Push failed - offline');
            return { success: false, error: 'Offline' };
        }

        try {
            const userId = this.getUserId();
            const data = DataManager.exportData();
            data._deviceInfo = navigator.userAgent.substring(0, 50);

            Logger.info('CloudSync', 'Pushing data to cloud', { userId });

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, data })
            });

            const result = await response.json();

            if (result.success) {
                this.setLastSync(result.lastSync);
                Logger.info('CloudSync', 'Push successful', { lastSync: result.lastSync });
                return { success: true, lastSync: result.lastSync };
            } else {
                Logger.error('CloudSync', 'Push failed', { error: result.error });
                return { success: false, error: result.error };
            }
        } catch (error) {
            Logger.error('CloudSync', 'Push error', { error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Pull data from cloud
    async pullFromCloud() {
        if (!this.isOnline()) {
            Logger.warn('CloudSync', 'Pull failed - offline');
            return { success: false, error: 'Offline' };
        }

        try {
            const userId = this.getUserId();
            Logger.info('CloudSync', 'Pulling data from cloud', { userId });

            // Use POST with userId in body instead of URL query params for security
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'pull' })
            });
            const result = await response.json();

            if (result.data) {
                Logger.info('CloudSync', 'Pull successful', { lastSync: result.lastSync });
                return { success: true, data: result.data, lastSync: result.lastSync };
            } else {
                Logger.info('CloudSync', 'No cloud data found');
                return { success: true, data: null, message: 'No cloud data' };
            }
        } catch (error) {
            Logger.error('CloudSync', 'Pull error', { error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Merge cloud data with local (cloud wins for conflicts)
    mergeData(cloudData) {
        if (!cloudData) return false;

        // Remove internal sync fields
        delete cloudData._lastSync;
        delete cloudData._deviceInfo;

        // Import cloud data (replaces local)
        const success = DataManager.importData(cloudData);

        if (success) {
            Logger.info('CloudSync', 'Data merged successfully');
        } else {
            Logger.error('CloudSync', 'Data merge failed');
        }

        return success;
    },

    // Full sync (pull then push)
    async fullSync() {
        Logger.info('CloudSync', 'Starting full sync');

        const pullResult = await this.pullFromCloud();

        if (pullResult.success && pullResult.data) {
            const localLastSync = this.getLastSync();
            const cloudLastSync = pullResult.lastSync;

            // If cloud is newer, merge
            if (!localLastSync || new Date(cloudLastSync) > new Date(localLastSync)) {
                Logger.info('CloudSync', 'Cloud data is newer, merging');
                this.mergeData(pullResult.data);
            } else {
                Logger.info('CloudSync', 'Local data is newer, skipping merge');
            }
        }

        // Push current state
        return await this.pushToCloud();
    },

    // Get sync status for UI
    getSyncStatus() {
        const lastSync = this.getLastSync();
        const isOnline = this.isOnline();

        return {
            isOnline,
            lastSync,
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

    // Set user ID (for restore)
    setUserId(newId) {
        if (newId && newId.startsWith('fuel_')) {
            localStorage.setItem('fuelTrackerUserId', newId);
            Logger.info('CloudSync', 'User ID set', { userId: newId });
            return true;
        }
        Logger.warn('CloudSync', 'Invalid user ID format', { userId: newId });
        return false;
    }
};

// Auto-sync on visibility change (when user returns to app)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && CloudSync.isOnline()) {
        // Debounce - sync after 2 seconds
        setTimeout(() => {
            const settings = DataManager.getSettings();
            if (settings && settings.cloudSync) {
                CloudSync.pushToCloud();
            }
        }, 2000);
    }
});

// Listen for online/offline events
window.addEventListener('online', () => {
    const settings = DataManager.getSettings();
    if (settings && settings.cloudSync) {
        showNotification('Online - synchronizuji...', 'cloud_sync');
        CloudSync.fullSync().then(result => {
            if (result.success) {
                showNotification('Data synchronizována', 'cloud_done');
            }
        });
    }
});

window.addEventListener('offline', () => {
    showNotification('Offline režim', 'cloud_off');
});

Logger.info('CloudSync', 'Cloud sync module loaded');
