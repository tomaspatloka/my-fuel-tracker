"use strict";

/**
 * Centralized Logging and Error Handling Utility
 * Provides structured logging with different severity levels
 */
const Logger = {
    // Log levels
    LEVELS: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    },

    // Current log level (can be adjusted in settings)
    currentLevel: 1, // INFO by default

    // Log storage (keep last 100 logs in memory)
    logs: [],
    maxLogs: 100,

    /**
     * Initialize logger with settings
     */
    init: function(settings = {}) {
        this.currentLevel = settings.logLevel || this.LEVELS.INFO;
        this.enableConsole = settings.enableConsole !== false; // default true

        // Set up global error handler
        window.addEventListener('error', (event) => {
            this.error('Global Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Set up unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        this.info('Logger initialized', { level: this.currentLevel });
    },

    /**
     * Format log entry
     */
    _formatLog: function(level, category, message, data) {
        return {
            timestamp: new Date().toISOString(),
            level: Object.keys(this.LEVELS).find(k => this.LEVELS[k] === level),
            category,
            message,
            data: data || null
        };
    },

    /**
     * Store log in memory
     */
    _storeLog: function(logEntry) {
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest
        }

        // Persist errors to localStorage for debugging
        if (logEntry.level === 'ERROR' || logEntry.level === 'FATAL') {
            try {
                const errorLogs = JSON.parse(localStorage.getItem('fuelTrackerErrors') || '[]');
                errorLogs.push(logEntry);
                // Keep last 50 errors
                if (errorLogs.length > 50) errorLogs.shift();
                localStorage.setItem('fuelTrackerErrors', JSON.stringify(errorLogs));
            } catch (e) {
                console.error('Failed to persist error log', e);
            }
        }
    },

    /**
     * Log to console if enabled
     */
    _logToConsole: function(logEntry) {
        if (!this.enableConsole) return;

        const prefix = `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.category}:`;
        const style = this._getConsoleStyle(logEntry.level);

        switch (logEntry.level) {
            case 'DEBUG':
                console.debug(prefix, logEntry.message, logEntry.data || '');
                break;
            case 'INFO':
                console.info(prefix, logEntry.message, logEntry.data || '');
                break;
            case 'WARN':
                console.warn(prefix, logEntry.message, logEntry.data || '');
                break;
            case 'ERROR':
            case 'FATAL':
                console.error(prefix, logEntry.message, logEntry.data || '');
                if (logEntry.data && logEntry.data.stack) {
                    console.error('Stack trace:', logEntry.data.stack);
                }
                break;
        }
    },

    /**
     * Get console style for log level
     */
    _getConsoleStyle: function(level) {
        const styles = {
            DEBUG: 'color: gray',
            INFO: 'color: blue',
            WARN: 'color: orange',
            ERROR: 'color: red',
            FATAL: 'color: red; font-weight: bold'
        };
        return styles[level] || '';
    },

    /**
     * Generic log method
     */
    _log: function(level, category, message, data) {
        if (level < this.currentLevel) return;

        const logEntry = this._formatLog(level, category, message, data);
        this._storeLog(logEntry);
        this._logToConsole(logEntry);

        return logEntry;
    },

    /**
     * Debug log
     */
    debug: function(category, message, data) {
        return this._log(this.LEVELS.DEBUG, category, message, data);
    },

    /**
     * Info log
     */
    info: function(category, message, data) {
        return this._log(this.LEVELS.INFO, category, message, data);
    },

    /**
     * Warning log
     */
    warn: function(category, message, data) {
        return this._log(this.LEVELS.WARN, category, message, data);
    },

    /**
     * Error log
     */
    error: function(category, message, data) {
        return this._log(this.LEVELS.ERROR, category, message, data);
    },

    /**
     * Fatal error log
     */
    fatal: function(category, message, data) {
        return this._log(this.LEVELS.FATAL, category, message, data);
    },

    /**
     * Get all logs
     */
    getLogs: function(level = null) {
        if (level === null) return this.logs;
        const levelName = Object.keys(this.LEVELS).find(k => this.LEVELS[k] === level);
        return this.logs.filter(log => log.level === levelName);
    },

    /**
     * Get error logs from localStorage
     */
    getPersistedErrors: function() {
        try {
            return JSON.parse(localStorage.getItem('fuelTrackerErrors') || '[]');
        } catch (e) {
            console.error('Failed to retrieve error logs', e);
            return [];
        }
    },

    /**
     * Clear logs
     */
    clearLogs: function() {
        this.logs = [];
        this.info('Logger', 'Logs cleared');
    },

    /**
     * Clear persisted error logs
     */
    clearPersistedErrors: function() {
        try {
            localStorage.removeItem('fuelTrackerErrors');
            this.info('Logger', 'Persisted errors cleared');
        } catch (e) {
            this.error('Logger', 'Failed to clear persisted errors', { error: e.message });
        }
    },

    /**
     * Export logs as JSON
     */
    exportLogs: function() {
        const data = {
            currentLogs: this.logs,
            persistedErrors: this.getPersistedErrors(),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fuel_tracker_logs_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.info('Logger', 'Logs exported');
    }
};

/**
 * Error Handler Utility
 * Provides error handling wrappers and validation
 */
const ErrorHandler = {
    /**
     * Wrap a function with try-catch and logging
     */
    wrap: function(fn, context = 'Unknown') {
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                Logger.error(context, 'Function execution failed', {
                    error: error.message,
                    stack: error.stack,
                    args: args
                });

                // Show user-friendly error
                if (typeof showNotification === 'function') {
                    showNotification('Nastala chyba. Zkuste to prosím znovu.');
                }

                return null;
            }
        };
    },

    /**
     * Wrap async function with try-catch and logging
     */
    wrapAsync: async function(fn, context = 'Unknown') {
        try {
            return await fn();
        } catch (error) {
            Logger.error(context, 'Async function execution failed', {
                error: error.message,
                stack: error.stack
            });

            if (typeof showNotification === 'function') {
                showNotification('Nastala chyba. Zkuste to prosím znovu.');
            }

            throw error;
        }
    },

    /**
     * Validate required fields
     */
    validateRequired: function(fields, data) {
        const missing = [];

        for (const field of fields) {
            if (!data[field] && data[field] !== 0) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            Logger.warn('Validation', 'Missing required fields', { fields: missing });
            return {
                valid: false,
                missing: missing
            };
        }

        return { valid: true };
    },

    /**
     * Validate number range
     */
    validateRange: function(value, min, max, fieldName) {
        if (typeof value !== 'number' || isNaN(value)) {
            Logger.warn('Validation', 'Invalid number', { fieldName, value });
            return {
                valid: false,
                error: `${fieldName} musí být číslo`
            };
        }

        if (value < min || value > max) {
            Logger.warn('Validation', 'Value out of range', {
                fieldName,
                value,
                min,
                max
            });
            return {
                valid: false,
                error: `${fieldName} musí být mezi ${min} a ${max}`
            };
        }

        return { valid: true };
    },

    /**
     * Validate date
     */
    validateDate: function(dateStr, fieldName) {
        const date = new Date(dateStr);

        if (isNaN(date.getTime())) {
            Logger.warn('Validation', 'Invalid date', { fieldName, dateStr });
            return {
                valid: false,
                error: `${fieldName} není platné datum`
            };
        }

        // Check if date is not in future
        if (date > new Date()) {
            Logger.warn('Validation', 'Date in future', { fieldName, dateStr });
            return {
                valid: false,
                error: `${fieldName} nemůže být v budoucnosti`
            };
        }

        return { valid: true, date };
    }
};
