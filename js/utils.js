"use strict";

/**
 * Shared helpers used by all other scripts (loaded first).
 */

/**
 * Local calendar dates (YYYY-MM-DD).
 * new Date('2026-09-29') means UTC midnight, which in Czech time shifts the day
 * around midnight and marks a vignette as expired on its last valid day.
 * All date logic in the app therefore goes through these helpers.
 */
const DateUtil = {
    pad: function (n) {
        return String(n).padStart(2, '0');
    },

    /** Date object -> 'YYYY-MM-DD' in local time */
    toDateStr: function (d) {
        return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
    },

    /** Today as 'YYYY-MM-DD' in local time */
    today: function () {
        return this.toDateStr(new Date());
    },

    /** 'YYYY-MM-DD' (or any date string) -> Date at local midnight, null if invalid */
    parse: function (str) {
        if (!str) return null;
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(str));
        if (m) {
            const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
            return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    },

    /** Normalize any date value to 'YYYY-MM-DD', null if invalid */
    normalize: function (str) {
        const d = this.parse(str);
        return d ? this.toDateStr(d) : null;
    },

    addDays: function (str, days) {
        const d = this.parse(str);
        if (!d) return null;
        d.setDate(d.getDate() + days);
        return this.toDateStr(d);
    },

    /** Whole days from 'from' to 'to' (positive when 'to' is later) */
    daysBetween: function (fromStr, toStr) {
        const a = this.parse(fromStr);
        const b = this.parse(toStr);
        if (!a || !b) return null;
        return Math.round((b - a) / 86400000);
    },

    /** Month 1-12 */
    month: function (str) {
        const d = this.parse(str);
        return d ? d.getMonth() + 1 : null;
    },

    /** Czech format d.m.yyyy */
    format: function (str) {
        const d = this.parse(str);
        if (!d) return '';
        return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    }
};

/**
 * XSS Protection - Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const str = String(text);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * IDs end up inside onclick="..." attributes, so only allow safe characters.
 * Generated IDs are base36, anything else comes from a tampered import.
 */
function isSafeId(id) {
    return typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

/**
 * Number formatting for display (Czech locale, fixed decimals)
 */
function formatNumber(value, decimals = 0) {
    const n = Number(value);
    if (!isFinite(n)) return '--';
    return n.toLocaleString('cs-CZ', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
