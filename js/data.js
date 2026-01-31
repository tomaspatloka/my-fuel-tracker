"use strict";

const DataManager = {
    DATA_VERSION: '2.3.0', // Current data structure version

    // Cloud push timeout for debouncing
    _cloudPushTimeout: null,

    // Default State
    state: {
        version: '2.3.0', // Data version
        vehicles: [],
        refuels: [],
        services: [], // Service records (repairs, vignettes, insurance, etc.)
        settings: {
            darkMode: false,
            darkModeAuto: true, // Auto detect from system
            notifications: true,
            currency: "Kč",
            activeVehicleId: null,
            minPrice: 25,
            maxPrice: 45,
            cloudSync: false // Cloud synchronization
        }
    },

    // Load data from LocalStorage
    init: function () {
        try {
            Logger.info('DataManager', 'Initializing data manager');

            const saved = localStorage.getItem('fuelTrackerData');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    this.state = { ...this.state, ...parsed };

                    // Ensure array initialization if corrupt
                    if (!this.state.vehicles) this.state.vehicles = [];
                    if (!this.state.refuels) this.state.refuels = [];
                    if (!this.state.services) this.state.services = [];

                    // Migrate data if needed
                    this._migrateData(parsed);

                    // Validate data integrity
                    this._validateDataIntegrity();

                    Logger.info('DataManager', 'Data loaded successfully', {
                        vehiclesCount: this.state.vehicles.length,
                        refuelsCount: this.state.refuels.length
                    });
                } catch (e) {
                    Logger.error('DataManager', 'Failed to parse saved data', {
                        error: e.message,
                        stack: e.stack
                    });

                    // Try to backup corrupted data
                    this._backupCorruptedData(saved);

                    // Initialize with default data
                    this.seedInitialData();

                    if (typeof showNotification === 'function') {
                        showNotification('Data byla poškozená, obnovena výchozí data');
                    }
                }
            } else {
                Logger.info('DataManager', 'No saved data found, seeding initial data');
                // Seed initial data if empty
                this.seedInitialData();
            }

            this.applySettings();
        } catch (e) {
            Logger.fatal('DataManager', 'Critical error during initialization', {
                error: e.message,
                stack: e.stack
            });

            // Last resort - use completely fresh state
            this.state = {
                vehicles: [],
                refuels: [],
                services: [],
                settings: {
                    darkMode: false,
                    darkModeAuto: true,
                    notifications: true,
                    currency: "Kč",
                    activeVehicleId: null,
                    minPrice: 25,
                    maxPrice: 45,
                    cloudSync: false
                }
            };
        }
    },

    /**
     * Validate data integrity
     */
    _validateDataIntegrity: function() {
        let issuesFound = 0;

        // Validate vehicles
        this.state.vehicles = this.state.vehicles.filter(v => {
            if (!v.id || !v.name) {
                Logger.warn('DataManager', 'Invalid vehicle found and removed', { vehicle: v });
                issuesFound++;
                return false;
            }
            return true;
        });

        // Validate refuels
        this.state.refuels = this.state.refuels.filter(r => {
            if (!r.id || !r.vehicleId || !r.odometer) {
                Logger.warn('DataManager', 'Invalid refuel found and removed', { refuel: r });
                issuesFound++;
                return false;
            }
            return true;
        });

        // Remove orphaned refuels (refuels for deleted vehicles)
        const vehicleIds = new Set(this.state.vehicles.map(v => v.id));
        const beforeCount = this.state.refuels.length;
        this.state.refuels = this.state.refuels.filter(r => {
            if (!vehicleIds.has(r.vehicleId)) {
                Logger.warn('DataManager', 'Orphaned refuel removed', { refuel: r });
                return false;
            }
            return true;
        });

        if (this.state.refuels.length < beforeCount) {
            issuesFound += (beforeCount - this.state.refuels.length);
        }

        // Validate services
        if (!this.state.services) this.state.services = [];
        const beforeServicesCount = this.state.services.length;
        this.state.services = this.state.services.filter(s => {
            if (!s.id || !s.vehicleId || !s.date) {
                Logger.warn('DataManager', 'Invalid service found and removed', { service: s });
                return false;
            }
            // Remove orphaned services
            if (!vehicleIds.has(s.vehicleId)) {
                Logger.warn('DataManager', 'Orphaned service removed', { service: s });
                return false;
            }
            return true;
        });

        if (this.state.services.length < beforeServicesCount) {
            issuesFound += (beforeServicesCount - this.state.services.length);
        }

        if (issuesFound > 0) {
            Logger.warn('DataManager', 'Data integrity issues found and fixed', {
                issuesCount: issuesFound
            });
            this.save(); // Save cleaned data
        }
    },

    /**
     * Migrate data between versions
     */
    _migrateData: function(oldData) {
        const oldVersion = oldData.version || '1.0.0';
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
            // Migration from v1.x to v2.x
            if (oldVersion.startsWith('1.')) {
                Logger.info('DataManager', 'Migrating from v1.x to v2.x');

                // Add darkModeAuto if missing
                if (this.state.settings && !this.state.settings.hasOwnProperty('darkModeAuto')) {
                    this.state.settings.darkModeAuto = true;
                    Logger.debug('DataManager', 'Added darkModeAuto setting');
                }
            }

            // Migration from v2.0.x to v2.1.x
            if (oldVersion.startsWith('2.0')) {
                Logger.info('DataManager', 'Migrating from v2.0.x to v2.1.x');

                // Add version to state if missing
                if (!this.state.version) {
                    this.state.version = this.DATA_VERSION;
                }

                // Add new settings
                if (this.state.settings && !this.state.settings.hasOwnProperty('darkModeAuto')) {
                    this.state.settings.darkModeAuto = true;
                    Logger.debug('DataManager', 'Added darkModeAuto setting');
                }
            }

            // Update version
            this.state.version = this.DATA_VERSION;
            this.save();

            Logger.info('DataManager', 'Migration completed successfully', {
                newVersion: this.DATA_VERSION
            });

            if (typeof showNotification === 'function') {
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
    _backupCorruptedData: function(corruptedData) {
        try {
            const timestamp = Date.now();
            localStorage.setItem(`fuelTrackerData_corrupted_${timestamp}`, corruptedData);
            Logger.info('DataManager', 'Corrupted data backed up', { timestamp });
        } catch (e) {
            Logger.error('DataManager', 'Failed to backup corrupted data', {
                error: e.message
            });
        }
    },

    seedInitialData: function () {
        // Create a default car so the user sees something
        const defaultCarId = this.generateId();
        this.state.vehicles.push({
            id: defaultCarId,
            name: "Vzorové Auto",
            manufacturer: "Škoda",
            type: "Octavia",
            engine: "2.0 TDI",
            tankSize: 50,
            isDefault: true
        });
        this.state.settings.activeVehicleId = defaultCarId;
        this.save();
    },

    save: function () {
        try {
            const dataStr = JSON.stringify(this.state);

            // Check localStorage quota
            try {
                localStorage.setItem('fuelTrackerData', dataStr);
                Logger.debug('DataManager', 'Data saved successfully', {
                    dataSize: dataStr.length
                });

                // Schedule cloud push if cloud sync is enabled
                this._scheduleCloudPush();

            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError') {
                    Logger.error('DataManager', 'Storage quota exceeded', {
                        dataSize: dataStr.length,
                        error: quotaError.message
                    });

                    if (typeof showNotification === 'function') {
                        showNotification('Úložiště je plné! Exportujte a smažte stará data.');
                    }

                    // Try to clear old backups
                    this._clearOldBackups();

                    // Retry save
                    localStorage.setItem('fuelTrackerData', dataStr);
                } else {
                    throw quotaError;
                }
            }
        } catch (e) {
            Logger.error('DataManager', 'Failed to save data', {
                error: e.message,
                stack: e.stack
            });

            if (typeof showNotification === 'function') {
                showNotification('Chyba při ukládání dat!');
            }
        }
    },

    /**
     * Schedule cloud push (debounced)
     * Waits 5 seconds after last change before syncing to cloud
     */
    _scheduleCloudPush: function() {
        // Only if cloud sync is enabled and CloudSync is available
        if (!this.state.settings.cloudSync || typeof CloudSync === 'undefined') {
            return;
        }

        // Only if online
        if (!CloudSync.isOnline()) {
            Logger.debug('DataManager', 'Skipping cloud push - offline');
            return;
        }

        // Clear previous timeout
        if (this._cloudPushTimeout) {
            clearTimeout(this._cloudPushTimeout);
        }

        // Schedule new push after 5 seconds
        this._cloudPushTimeout = setTimeout(() => {
            Logger.info('DataManager', 'Auto-pushing data to cloud');
            CloudSync.pushToCloud().then(result => {
                if (result.success) {
                    Logger.info('DataManager', 'Auto cloud push successful');
                } else {
                    Logger.warn('DataManager', 'Auto cloud push failed', { error: result.error });
                }
            }).catch(error => {
                Logger.error('DataManager', 'Auto cloud push error', { error: error.message });
            });
        }, 5000); // 5 seconds debounce

        Logger.debug('DataManager', 'Cloud push scheduled (5s)');
    },

    /**
     * Clear old corrupted data backups
     */
    _clearOldBackups: function() {
        try {
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(k => k.startsWith('fuelTrackerData_corrupted_'));

            backupKeys.forEach(key => {
                localStorage.removeItem(key);
                Logger.info('DataManager', 'Old backup removed', { key });
            });
        } catch (e) {
            Logger.error('DataManager', 'Failed to clear old backups', {
                error: e.message
            });
        }
    },

    applySettings: function () {
        let shouldUseDarkMode = this.state.settings.darkMode;

        // Auto dark mode - check system preference
        if (this.state.settings.darkModeAuto) {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            shouldUseDarkMode = prefersDark;
            Logger.debug('Settings', 'Auto dark mode detected', { prefersDark });
        }

        if (shouldUseDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Listen for system theme changes
        if (window.matchMedia && this.state.settings.darkModeAuto) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                Logger.info('Settings', 'System theme changed', { isDark: e.matches });
                this.applySettings();
            });
        }
    },

    // --- Vehicle Methods ---
    getVehicles: function () {
        return this.state.vehicles;
    },

    getVehicle: function (id) {
        return this.state.vehicles.find(v => v.id === id);
    },

    getActiveVehicle: function () {
        if (!this.state.settings.activeVehicleId) {
            if (this.state.vehicles.length > 0) {
                return this.state.vehicles[0];
            }
            return null;
        }
        return this.state.vehicles.find(v => v.id === this.state.settings.activeVehicleId);
    },

    saveVehicle: function (vehicleData) {
        if (vehicleData.id) {
            // Update
            const index = this.state.vehicles.findIndex(v => v.id === vehicleData.id);
            if (index !== -1) {
                this.state.vehicles[index] = { ...this.state.vehicles[index], ...vehicleData };
            }
        } else {
            // Create
            vehicleData.id = this.generateId();
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
        this.state.vehicles = this.state.vehicles.filter(v => v.id !== id);
        this.state.refuels = this.state.refuels.filter(r => r.vehicleId !== id);
        if (this.state.settings.activeVehicleId === id) {
            this.state.settings.activeVehicleId = this.state.vehicles.length > 0 ? this.state.vehicles[0].id : null;
        }
        this.save();
    },

    setActiveVehicle: function (id) {
        this.state.settings.activeVehicleId = id;
        this.save();
    },

    // --- Refuel Methods ---
    getRefuels: function (vehicleId) {
        return this.state.refuels
            .filter(r => r.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
    },

    getRefuel: function (id) {
        return this.state.refuels.find(r => r.id === id);
    },

    addRefuel: function (refuelData) {
        try {
            // Validate refuel data
            const validation = this._validateRefuelData(refuelData);
            if (!validation.valid) {
                Logger.error('DataManager', 'Invalid refuel data', {
                    errors: validation.errors,
                    data: refuelData
                });

                if (typeof showNotification === 'function') {
                    showNotification(validation.errors[0] || 'Neplatná data tankování');
                }
                return null;
            }

            refuelData.id = this.generateId();
            this.state.refuels.push(refuelData);
            this.save();

            Logger.info('DataManager', 'Refuel added successfully', {
                refuelId: refuelData.id,
                vehicleId: refuelData.vehicleId
            });

            return refuelData;
        } catch (e) {
            Logger.error('DataManager', 'Failed to add refuel', {
                error: e.message,
                stack: e.stack,
                data: refuelData
            });
            return null;
        }
    },

    /**
     * Validate refuel data
     */
    _validateRefuelData: function(data) {
        const errors = [];

        // Required fields
        const required = ErrorHandler.validateRequired(
            ['vehicleId', 'date', 'odometer', 'liters', 'pricePerLiter', 'totalPrice'],
            data
        );

        if (!required.valid) {
            errors.push(`Chybí povinná pole: ${required.missing.join(', ')}`);
        }

        // Validate odometer
        const odoValidation = ErrorHandler.validateRange(
            data.odometer,
            0,
            9999999,
            'Stav tachometru'
        );
        if (!odoValidation.valid) {
            errors.push(odoValidation.error);
        }

        // Validate liters
        const litersValidation = ErrorHandler.validateRange(
            data.liters,
            0.01,
            1000,
            'Natankované litry'
        );
        if (!litersValidation.valid) {
            errors.push(litersValidation.error);
        }

        // Validate price
        const priceValidation = ErrorHandler.validateRange(
            data.pricePerLiter,
            0.01,
            1000,
            'Cena za litr'
        );
        if (!priceValidation.valid) {
            errors.push(priceValidation.error);
        }

        // Validate date
        const dateValidation = ErrorHandler.validateDate(data.date, 'Datum');
        if (!dateValidation.valid) {
            errors.push(dateValidation.error);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    updateRefuel: function (refuelData) {
        try {
            const validation = this._validateRefuelData(refuelData);
            if (!validation.valid) {
                Logger.error('DataManager', 'Invalid refuel data for update', {
                    errors: validation.errors,
                    data: refuelData
                });

                if (typeof showNotification === 'function') {
                    showNotification(validation.errors[0] || 'Neplatná data tankování');
                }
                return false;
            }

            const index = this.state.refuels.findIndex(r => r.id === refuelData.id);
            if (index !== -1) {
                this.state.refuels[index] = { ...this.state.refuels[index], ...refuelData };
                this.save();

                Logger.info('DataManager', 'Refuel updated successfully', {
                    refuelId: refuelData.id
                });

                return true;
            }

            Logger.warn('DataManager', 'Refuel not found for update', {
                refuelId: refuelData.id
            });

            return false;
        } catch (e) {
            Logger.error('DataManager', 'Failed to update refuel', {
                error: e.message,
                stack: e.stack,
                data: refuelData
            });
            return false;
        }
    },

    deleteRefuel: function (id) {
        try {
            const beforeCount = this.state.refuels.length;
            this.state.refuels = this.state.refuels.filter(r => r.id !== id);
            const afterCount = this.state.refuels.length;

            if (beforeCount === afterCount) {
                Logger.warn('DataManager', 'Refuel not found for deletion', { refuelId: id });
                return false;
            }

            this.save();

            Logger.info('DataManager', 'Refuel deleted successfully', { refuelId: id });
            return true;
        } catch (e) {
            Logger.error('DataManager', 'Failed to delete refuel', {
                error: e.message,
                stack: e.stack,
                refuelId: id
            });
            return false;
        }
    },

    // --- Stats Helpers ---
    calculateStats: function (vehicleId) {
        try {
            Logger.debug('DataManager', 'Calculating stats', { vehicleId });

            const logs = this.getRefuels(vehicleId).reverse(); // Oldest first for calculation
            if (logs.length < 2) {
                Logger.debug('DataManager', 'Not enough data for stats', {
                    vehicleId,
                    logsCount: logs.length
                });
                return null;
            }

        let totalDist = 0;
        let totalLiters = 0;
        let totalCost = 0;
        let minCons = Infinity;
        let maxCons = 0;

        let seasonal = {
            spring: { dist: 0, liters: 0, cost: 0 },
            summer: { dist: 0, liters: 0, cost: 0 },
            autumn: { dist: 0, liters: 0, cost: 0 },
            winter: { dist: 0, liters: 0, cost: 0 }
        };

        let consumptions = [];

        // Logic: Consumption is calculated between FULL refills.
        // If Refuel A (Full) -> Refuel B (Full), consumption = B.liters / (B.odo - A.odo) * 100

        let lastFullRefuel = logs[0].isFullTank ? logs[0] : null;

        for (let i = 1; i < logs.length; i++) {
            const current = logs[i];

            // Basic totals
            totalCost += current.totalPrice;

            if (current.isFullTank && lastFullRefuel) {
                const dist = current.odometer - lastFullRefuel.odometer;
                if (dist > 0) {
                    const liters = current.liters; // Simplified: Assuming we used these liters to go that distance
                    // Note: If there were partial refuels in between, we should sum them up.
                    // Advanced logic: look for partials between lastFull and current
                    // For now, simpler logic: if previous was full, this consumption is valid for this segment.
                    // If previous was NOT full, we can't easily calculate exact consumption for that segment alone without summing partials.

                    // Better logic: Find previous Full tank
                    // Sum liters of all refuels SINCE previous full tank (exclusive) UP TO current (inclusive)
                    // Distance = current.odo - previousFull.odo

                    let litersSinceLastFull = 0;
                    let costSinceLastFull = 0;
                    let validSegment = true;

                    // Look back from current to find last full
                    let j = i;
                    let distSegment = 0;
                    let prevFullIndex = -1;

                    // Find most recent previous full tank
                    for (let k = i - 1; k >= 0; k--) {
                        if (logs[k].isFullTank) {
                            prevFullIndex = k;
                            break;
                        }
                    }

                    if (prevFullIndex !== -1) {
                        const prevFull = logs[prevFullIndex];
                        const dist = current.odometer - prevFull.odometer;

                        // Sum liters of all fills between prevFull (exclusive) and current (inclusive)
                        let segmentLiters = 0;
                        for (let k = prevFullIndex + 1; k <= i; k++) {
                            segmentLiters += logs[k].liters;
                        }

                        if (dist > 0) {
                            const cons = (segmentLiters / dist) * 100;
                            consumptions.push({ date: current.date, value: cons });

                            if (cons < minCons) minCons = cons;
                            if (cons > maxCons) maxCons = cons;

                            totalDist += dist;
                            totalLiters += segmentLiters;

                            // Calculate seasonal
                            const month = new Date(current.date).getMonth() + 1; // 1-12
                            let season = '';
                            if (month >= 3 && month <= 5) season = 'spring';
                            else if (month >= 6 && month <= 8) season = 'summer';
                            else if (month >= 9 && month <= 11) season = 'autumn';
                            else season = 'winter';

                            seasonal[season].dist += dist;
                            seasonal[season].liters += segmentLiters;
                            seasonal[season].cost += current.totalPrice; // Approx
                        }
                    }
                }
                lastFullRefuel = current;
            }
        }

        const avgCons = totalDist > 0 ? (totalLiters / totalDist) * 100 : 0;
        const avgCostKm = totalDist > 0 ? (totalCost / totalDist) : 0; // This is rough total cost

            const stats = {
                avgCons: avgCons.toFixed(1),
                minCons: minCons === Infinity ? 0 : minCons.toFixed(1),
                maxCons: maxCons.toFixed(1),
                totalCost: totalCost.toFixed(0),
                costPerKm: avgCostKm.toFixed(2),
                seasonal,
                consumptions,
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

    // --- Service Records Methods ---
    getServices: function (vehicleId) {
        if (!this.state.services) this.state.services = [];
        return this.state.services
            .filter(s => s.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
    },

    getService: function (id) {
        if (!this.state.services) this.state.services = [];
        return this.state.services.find(s => s.id === id);
    },

    addService: function (serviceData) {
        try {
            if (!this.state.services) this.state.services = [];

            serviceData.id = this.generateId();
            this.state.services.push(serviceData);
            this.save();

            Logger.info('DataManager', 'Service record added', {
                serviceId: serviceData.id,
                type: serviceData.type
            });

            return serviceData;
        } catch (e) {
            Logger.error('DataManager', 'Failed to add service record', {
                error: e.message,
                data: serviceData
            });
            return null;
        }
    },

    updateService: function (serviceData) {
        try {
            if (!this.state.services) this.state.services = [];

            const index = this.state.services.findIndex(s => s.id === serviceData.id);
            if (index !== -1) {
                this.state.services[index] = { ...this.state.services[index], ...serviceData };
                this.save();
                Logger.info('DataManager', 'Service record updated', { serviceId: serviceData.id });
                return true;
            }
            return false;
        } catch (e) {
            Logger.error('DataManager', 'Failed to update service record', {
                error: e.message,
                data: serviceData
            });
            return false;
        }
    },

    deleteService: function (id) {
        try {
            if (!this.state.services) this.state.services = [];

            const beforeCount = this.state.services.length;
            this.state.services = this.state.services.filter(s => s.id !== id);

            if (this.state.services.length < beforeCount) {
                this.save();
                Logger.info('DataManager', 'Service record deleted', { serviceId: id });
                return true;
            }
            return false;
        } catch (e) {
            Logger.error('DataManager', 'Failed to delete service record', {
                error: e.message,
                serviceId: id
            });
            return false;
        }
    },

    // Get services expiring soon (vignettes, insurance, inspection)
    getExpiringServices: function (vehicleId, daysAhead = 30) {
        if (!this.state.services) this.state.services = [];

        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        return this.state.services
            .filter(s => {
                if (s.vehicleId !== vehicleId) return false;
                if (!s.validUntil) return false;

                const expiry = new Date(s.validUntil);
                return expiry >= now && expiry <= futureDate;
            })
            .sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil));
    },

    // Get expired services
    getExpiredServices: function (vehicleId) {
        if (!this.state.services) this.state.services = [];

        const now = new Date();
        return this.state.services
            .filter(s => {
                if (s.vehicleId !== vehicleId) return false;
                if (!s.validUntil) return false;
                return new Date(s.validUntil) < now;
            })
            .sort((a, b) => new Date(b.validUntil) - new Date(a.validUntil));
    },

    // Calculate total service costs for a vehicle
    calculateServiceCosts: function (vehicleId) {
        if (!this.state.services) this.state.services = [];

        const services = this.state.services.filter(s => s.vehicleId === vehicleId);

        let totalCost = 0;
        let byType = {
            service: 0,
            vignette: 0,
            insurance: 0,
            inspection: 0,
            other: 0
        };

        services.forEach(s => {
            const cost = parseFloat(s.cost) || 0;
            totalCost += cost;
            if (byType.hasOwnProperty(s.type)) {
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

    /**
     * Calculate consumption for each refuel record
     * Returns object: { refuelId: consumption (number or null) }
     *
     * NEW LOGIC (v2.6.0):
     * - Calculates consumption for ALL refuels (not just full tank)
     * - Uses simple formula: liters / km * 100
     * - More accurate representation of actual consumption
     */
    calculateConsumptionForRefuels: function (vehicleId) {
        try {
            const logs = this.getRefuels(vehicleId).reverse(); // Oldest first
            const consumptionMap = {};

            if (logs.length < 2) {
                // Not enough data - first refuel cannot have consumption
                logs.forEach(log => {
                    consumptionMap[log.id] = null;
                });
                return consumptionMap;
            }

            // First refuel never has consumption (no previous data)
            consumptionMap[logs[0].id] = null;

            // Calculate consumption for each refuel based on previous refuel
            for (let i = 1; i < logs.length; i++) {
                const current = logs[i];
                const previous = logs[i - 1];

                // Calculate distance traveled since last refuel
                const distance = current.odometer - previous.odometer;

                // Validate distance (must be positive and reasonable)
                if (distance > 0 && distance < 5000) { // Max 5000 km between refuels (sanity check)
                    // Simple consumption calculation:
                    // consumption = liters / km * 100
                    const consumption = (current.liters / distance) * 100;

                    // Additional sanity check (consumption between 1-50 l/100km)
                    if (consumption >= 1 && consumption <= 50) {
                        consumptionMap[current.id] = parseFloat(consumption.toFixed(1));
                    } else {
                        // Unrealistic consumption, likely data error
                        Logger.warn('DataManager', 'Unrealistic consumption calculated', {
                            refuelId: current.id,
                            consumption: consumption.toFixed(1),
                            distance,
                            liters: current.liters
                        });
                        consumptionMap[current.id] = null;
                    }
                } else {
                    // Invalid distance (negative, zero, or too large)
                    consumptionMap[current.id] = null;
                }
            }

            return consumptionMap;
        } catch (e) {
            Logger.error('DataManager', 'Failed to calculate consumption for refuels', {
                error: e.message,
                vehicleId
            });
            return {};
        }
    },

    // --- Helpers ---
    generateId: function () {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // --- Settings Methods ---
    getSettings: function () {
        return this.state.settings;
    },

    updateSettings: function (newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
        this.applySettings();
        Logger.info('DataManager', 'Settings updated', newSettings);
    },

    // --- Export/Import for Cloud Sync ---
    exportData: function () {
        return JSON.parse(JSON.stringify(this.state));
    },

    importData: function (data) {
        try {
            if (!data || typeof data !== 'object') {
                Logger.error('DataManager', 'Invalid import data');
                return false;
            }

            // Validate basic structure
            if (!Array.isArray(data.vehicles) || !Array.isArray(data.refuels)) {
                Logger.error('DataManager', 'Invalid data structure');
                return false;
            }

            // Ensure services is an array (for backward compatibility)
            const services = Array.isArray(data.services) ? data.services : [];

            // Merge data
            this.state = {
                ...this.state,
                version: data.version || this.DATA_VERSION,
                vehicles: data.vehicles,
                refuels: data.refuels,
                services: services,
                settings: { ...this.state.settings, ...data.settings }
            };

            // Validate and clean
            this._validateDataIntegrity();
            this.save();
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
    }
};
