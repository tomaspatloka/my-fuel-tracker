"use strict";

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
 * DOM Helper - Safe DOM operations with error handling
 */
const DomHelper = {
    /**
     * Safely get element by ID
     */
    getElementById: function(id) {
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
    setContent: function(elementOrId, content) {
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
    getValue: function(id) {
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
    setValue: function(id, value) {
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
    addEventListener: function(elementOrId, event, handler) {
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

document.addEventListener('DOMContentLoaded', function () {
    try {
        // Initialize Logger first
        Logger.init({
            logLevel: Logger.LEVELS.INFO,
            enableConsole: true
        });

        Logger.info('App', 'Application starting');

        DataManager.init();
        renderApp();

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

function renderApp() {
    try {
        Logger.debug('App', 'Rendering app');

        updateVehicleSelector();

        // Check if we have active vehicle
        const activeVehicle = DataManager.getActiveVehicle();
        if (!activeVehicle && DataManager.state.vehicles.length > 0) {
            DataManager.setActiveVehicle(DataManager.state.vehicles[0].id);
        }

        // Default tab
        switchTab('dashboard');
    } catch (e) {
        Logger.error('App', 'Failed to render app', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při načítání aplikace');
    }
}

// === Navigation ===
function switchTab(tabName, event) {
    try {
        Logger.debug('Navigation', 'Switching tab', { tabName });

        // UI Update
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        } else {
            // Find tab by onclick attribute approximation if no event
            const btn = Array.from(document.querySelectorAll('.tab')).find(b => {
                const onclick = b.getAttribute('onclick');
                return onclick && onclick.includes(tabName);
            });
            if (btn) btn.classList.add('active');
        }

        // Render Content
        const contentEl = document.getElementById('mainContent');
        const fab = document.getElementById('fabContainer');

        if (!contentEl || !fab) {
            throw new Error('Required DOM elements not found');
        }

    // Show/Hide FAB
    if (tabName === 'dashboard' || tabName === 'refuel') {
        fab.style.display = 'flex';
        const btn = fab.querySelector('.fab-main');
        btn.onclick = () => openRefuelModal();
        btn.innerHTML = '<span class="material-symbols-outlined">add</span>';
    } else if (tabName === 'service') {
        fab.style.display = 'flex';
        const btn = fab.querySelector('.fab-main');
        btn.onclick = () => openServiceModal();
        btn.innerHTML = '<span class="material-symbols-outlined">add</span>';
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

        // Try to recover by showing error message
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
    if (id) {
        DataManager.setActiveVehicle(id);
        renderApp();
    }
}

function updateVehicleSelector() {
    const selector = document.getElementById('vehicleSelector');
    selector.innerHTML = '';
    const vehicles = DataManager.getVehicles();
    const active = DataManager.getActiveVehicle();

    if (vehicles.length === 0) {
        const opt = document.createElement('option');
        opt.text = "Žádné auto";
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
// Updated to support validation and dynamic currency

function renderDashboard(vehicle) {
    const stats = DataManager.calculateStats(vehicle.id);
    const logs = DataManager.getRefuels(vehicle.id);
    const last3 = logs.slice(0, 3);
    const currency = DataManager.state.settings.currency;
    const safeCurrency = escapeHtml(currency);

    const content = `
        <div class="card card-elevated">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">analytics</span>
                    Přehled - ${escapeHtml(vehicle.name)}
                </h2>
                <span style="font-size: 0.8rem; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 4px 8px; border-radius: 8px;">
                    ${escapeHtml(vehicle.engine)}
                </span>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats ? escapeHtml(stats.avgCons) : '--'}</div>
                    <div class="stat-label">Ø Spotřeba (l/100km)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats ? escapeHtml(stats.costPerKm) : '--'}</div>
                    <div class="stat-label">Cena/km (${safeCurrency})</div>
                </div>
            </div>

            <!-- Graph Container -->
            <div style="height: 200px; margin-bottom: 20px;">
                ${renderLineChart(stats ? stats.consumptions : [])}
            </div>

            <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Poslední tankování</h3>
            ${last3.length > 0 ? last3.map(log => createSwipeableLogItem(log, currency)).join('') : '<p style="color: var(--md-sys-color-outline);">Zatím žádné záznamy.</p>'}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
    attachSwipeListeners();
}

function renderRefuelHistory(vehicle) {
    const logs = DataManager.getRefuels(vehicle.id);
    const currency = DataManager.state.settings.currency;

    let listContent = '';
    if (logs.length === 0) {
        listContent = `<p style="text-align: center; color: var(--md-sys-color-outline); margin-top: 40px;">Zatím žádné tankování.</p>`;
    } else {
        listContent = logs.map(log => createSwipeableLogItem(log, currency)).join('');
    }

    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">history</span>
                    Historie tankování
                </h2>
            </div>
            <div class="history-list">
                ${listContent}
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;

    // Attach Swipe Listeners
    attachSwipeListeners();
}

// Helper to create HTML for swipe item
function createSwipeableLogItem(log, currency) {
    const safeId = escapeHtml(log.id);
    const safeCurrency = escapeHtml(currency);
    return `
    <div class="swipe-container" id="log-${safeId}" data-id="${safeId}">
        <div class="swipe-actions-left">
            <span class="material-symbols-outlined">edit</span>
        </div>
        <div class="swipe-actions-right">
            <span class="material-symbols-outlined">delete</span>
        </div>
        <div class="swipe-content log-item">
            <div style="flex: 1;">
                <div class="log-main">${escapeHtml(formatDate(log.date))}</div>
                <div class="log-sub">${escapeHtml(log.odometer)} km • ${escapeHtml(log.pricePerLiter)} ${safeCurrency}/l</div>
            </div>
            <div>
                <div class="log-value">${escapeHtml(log.liters)} l</div>
                <div class="log-sub" style="text-align: right;">${escapeHtml(log.totalPrice)} ${safeCurrency}</div>
            </div>
        </div>
    </div>
    `;
}

// === Swipe Logic ===
// Global swipe state to avoid memory leaks from multiple event listeners
const swipeState = {
    isDragging: false,
    startX: 0,
    currentX: 0,
    activeContent: null,
    activeId: null
};

// Initialize global mouse/touch handlers once
let swipeHandlersInitialized = false;

function initGlobalSwipeHandlers() {
    if (swipeHandlersInitialized) return;
    swipeHandlersInitialized = true;

    // Global mouse move handler
    window.addEventListener('mousemove', (e) => {
        if (!swipeState.isDragging || !swipeState.activeContent) return;
        swipeState.currentX = e.clientX - swipeState.startX;
        if (swipeState.currentX > 100) swipeState.currentX = 100;
        if (swipeState.currentX < -100) swipeState.currentX = -100;
        swipeState.activeContent.style.transform = `translateX(${swipeState.currentX}px)`;
    });

    // Global mouse up handler
    window.addEventListener('mouseup', () => {
        if (swipeState.isDragging && swipeState.activeContent) {
            swipeState.isDragging = false;
            swipeState.activeContent.style.transition = 'transform 0.2s ease-out';
            handleSwipeEnd(swipeState.activeContent, swipeState.currentX, swipeState.activeId);
            swipeState.currentX = 0;
            swipeState.activeContent = null;
            swipeState.activeId = null;
        }
    });
}

function attachSwipeListeners() {
    initGlobalSwipeHandlers();

    const items = document.querySelectorAll('.swipe-container:not([data-swipe-initialized])');
    items.forEach(item => {
        item.setAttribute('data-swipe-initialized', 'true');

        const content = item.querySelector('.swipe-content');
        const id = item.dataset.id;

        // Touch Events
        content.addEventListener('touchstart', (e) => {
            swipeState.startX = e.touches[0].clientX;
            swipeState.isDragging = true;
            swipeState.activeContent = content;
            swipeState.activeId = id;
            content.style.transition = 'none';
        });

        content.addEventListener('touchmove', (e) => {
            if (!swipeState.isDragging || swipeState.activeContent !== content) return;
            swipeState.currentX = e.touches[0].clientX - swipeState.startX;
            if (swipeState.currentX > 100) swipeState.currentX = 100;
            if (swipeState.currentX < -100) swipeState.currentX = -100;
            content.style.transform = `translateX(${swipeState.currentX}px)`;
        });

        content.addEventListener('touchend', () => {
            if (swipeState.activeContent !== content) return;
            swipeState.isDragging = false;
            content.style.transition = 'transform 0.2s ease-out';
            handleSwipeEnd(content, swipeState.currentX, id);
            swipeState.currentX = 0;
            swipeState.activeContent = null;
            swipeState.activeId = null;
        });

        // Mouse Events (for Desktop testing)
        content.addEventListener('mousedown', (e) => {
            swipeState.startX = e.clientX;
            swipeState.isDragging = true;
            swipeState.activeContent = content;
            swipeState.activeId = id;
            content.style.transition = 'none';
        });
    });
}

function handleSwipeEnd(element, distance, id) {
    if (distance > 50) {
        // Swiped Right -> Edit
        element.style.transform = `translateX(0px)`; // Reset visually
        openRefuelModal(id);
    } else if (distance < -50) {
        // Swiped Left -> Delete
        element.style.transform = `translateX(0px)`;
        deleteRefuel(id);
    } else {
        // Cancel
        element.style.transform = `translateX(0px)`;
    }
}

// === Modal Logic ===

function openRefuelModal(editId = null) {
    const activeVehicle = DataManager.getActiveVehicle();
    if (!activeVehicle) {
        showNotification('Vyberte nejprve vozidlo!');
        return;
    }

    const modalTitle = document.getElementById('refuelModalTitle');
    const currency = DataManager.state.settings.currency;

    document.getElementById('refuelVehicleId').value = activeVehicle.id;

    if (editId) {
        // Edit Mode
        const log = DataManager.getRefuel(editId);
        if (!log) return;

        modalTitle.textContent = 'Upravit tankování';
        document.getElementById('refuelId').value = log.id;
        document.getElementById('refuelDate').value = log.date;
        document.getElementById('refuelOdo').value = log.odometer;
        document.getElementById('refuelLiters').value = log.liters;
        document.getElementById('refuelPrice').value = log.pricePerLiter;
        document.getElementById('refuelTotal').value = log.totalPrice;
        document.getElementById('refuelFull').checked = log.isFullTank;
        document.getElementById('refuelNote').value = log.notes || '';
    } else {
        // Add Mode
        modalTitle.textContent = 'Nové tankování';
        document.getElementById('refuelId').value = '';
        document.getElementById('refuelDate').value = new Date().toISOString().split('T')[0];

        // Auto-fill ODO
        const logs = DataManager.getRefuels(activeVehicle.id);
        const lastOdo = logs.length > 0 ? logs[0].odometer : 0;
        document.getElementById('refuelOdo').value = '';
        document.getElementById('refuelOdoHint').textContent = `Poslední stav: ${lastOdo} km`;
        document.getElementById('refuelOdo').placeholder = lastOdo;

        document.getElementById('refuelLiters').value = '';
        document.getElementById('refuelPrice').value = '';
        document.getElementById('refuelTotal').value = '';
        document.getElementById('refuelFull').checked = true;
        document.getElementById('refuelNote').value = '';
    }

    // Pass currency to labels if needed (optional optimization)
    // Show Modal
    document.getElementById('refuelModal').classList.add('active');
}

function calculateTotal() {
    const liters = parseFloat(document.getElementById('refuelLiters').value);
    const price = parseFloat(document.getElementById('refuelPrice').value);
    const totalEl = document.getElementById('refuelTotal');

    if (!isNaN(liters) && !isNaN(price)) {
        const total = (liters * price).toFixed(1);
        totalEl.value = total;
    } else {
        totalEl.value = '';
    }
}

function saveRefuelFromModal() {
    try {
        Logger.debug('Refuel', 'Saving refuel from modal');

        const id = document.getElementById('refuelId').value;
        const vehicleId = document.getElementById('refuelVehicleId').value;
        const date = document.getElementById('refuelDate').value;
        const odoStr = document.getElementById('refuelOdo').value;
        const litersStr = document.getElementById('refuelLiters').value;
        const priceStr = document.getElementById('refuelPrice').value;
        const totalStr = document.getElementById('refuelTotal').value;
        const isFull = document.getElementById('refuelFull').checked;
        const note = document.getElementById('refuelNote').value;

        // Parse numbers
        const odo = parseInt(odoStr);
        const liters = parseFloat(litersStr);
        const price = parseFloat(priceStr);
        let total = parseFloat(totalStr);

        // Auto-calculate if total is missing but we have liters and price
        if ((!total || isNaN(total)) && liters && price) {
            total = parseFloat((liters * price).toFixed(2));
        }

        // Validation - Check for empty or invalid values
        if (!odoStr || isNaN(odo)) {
            showNotification("Zadejte platný stav tachometru.");
            Logger.warn('Refuel', 'Invalid odometer', { odo: odoStr });
            return;
        }

        if (!litersStr || isNaN(liters) || liters <= 0) {
            showNotification("Zadejte platné množství paliva.");
            Logger.warn('Refuel', 'Invalid liters', { liters: litersStr });
            return;
        }

        if (!priceStr || isNaN(price) || price <= 0) {
            showNotification("Zadejte platnou cenu za litr.");
            Logger.warn('Refuel', 'Invalid price', { price: priceStr });
            return;
        }

        if (!total || isNaN(total) || total <= 0) {
            showNotification("Celková cena není platná.");
            Logger.warn('Refuel', 'Invalid total', { total: totalStr });
            return;
        }

        if (!date) {
            showNotification("Zadejte datum.");
            Logger.warn('Refuel', 'Missing date');
            return;
        }

        const vehicle = DataManager.getVehicle(vehicleId);
        if (!vehicle) {
            showNotification("Vozidlo nenalezeno!");
            Logger.error('Refuel', 'Vehicle not found', { vehicleId });
            return;
        }

        // 1. Tank limit
        if (vehicle.tankSize && liters > vehicle.tankSize) {
            showNotification(`Chyba: Nádrž má pouze ${vehicle.tankSize} l!`);
            Logger.warn('Refuel', 'Liters exceed tank size', {
                liters,
                tankSize: vehicle.tankSize
            });
            return;
        }

        // 2. Price limit
        const minPrice = DataManager.state.settings.minPrice || 0;
        const maxPrice = DataManager.state.settings.maxPrice || 1000;
        if (price < minPrice || price > maxPrice) {
            showNotification(`Cena mimo limit (${minPrice}-${maxPrice} Kč/l)`);
            Logger.warn('Refuel', 'Price out of range', {
                price,
                minPrice,
                maxPrice
            });
            return;
        }

        // 3. Odo Logic check - validate based on DATE, not insertion order
        // This allows adding old forgotten refuels with past dates
        const logs = DataManager.getRefuels(vehicleId);
        if (logs.length > 0) {
            // Find where this refuel would fit chronologically based on date
            const newDate = new Date(date);

            // Get all other refuels (exclude current one if editing)
            const otherLogs = id ? logs.filter(r => r.id !== id) : logs;

            // Find the refuel immediately before this date (older)
            const prevRefuel = otherLogs.find(r => new Date(r.date) < newDate);
            // Find the refuel immediately after this date (newer) - reverse search
            const nextRefuel = [...otherLogs].reverse().find(r => new Date(r.date) > newDate);

            // Validate: odometer must be greater than previous (older) refuel
            if (prevRefuel && odo <= prevRefuel.odometer) {
                showNotification(`Tachometr musí být > ${prevRefuel.odometer} km (tankování z ${formatDate(prevRefuel.date)})`);
                Logger.warn('Refuel', 'Odometer must be greater than previous by date', {
                    newOdo: odo,
                    newDate: date,
                    prevOdo: prevRefuel.odometer,
                    prevDate: prevRefuel.date
                });
                return;
            }

            // Validate: odometer must be less than next (newer) refuel
            if (nextRefuel && odo >= nextRefuel.odometer) {
                showNotification(`Tachometr musí být < ${nextRefuel.odometer} km (tankování z ${formatDate(nextRefuel.date)})`);
                Logger.warn('Refuel', 'Odometer must be less than next by date', {
                    newOdo: odo,
                    newDate: date,
                    nextOdo: nextRefuel.odometer,
                    nextDate: nextRefuel.date
                });
                return;
            }
        }

        const data = {
            id: id || null,
            vehicleId,
            date,
            odometer: odo,
            liters,
            pricePerLiter: price,
            totalPrice: total,
            isFullTank: isFull,
            notes: note
        };

        let success = false;
        if (id) {
            success = DataManager.updateRefuel(data);
            if (success) {
                showNotification('Záznam upraven');
                Logger.info('Refuel', 'Refuel updated from modal', { refuelId: id });
            }
        } else {
            const result = DataManager.addRefuel(data);
            success = result !== null;
            if (success) {
                showNotification('Záznam uložen');
                Logger.info('Refuel', 'Refuel added from modal', { refuelId: result.id });
            }
        }

        if (!success) {
            showNotification('Chyba při ukládání záznamu');
            return;
        }

        closeModal('refuelModal');

        // Refresh
        try {
            const currentTab = document.querySelector('.tab.active');
            if (currentTab) {
                const onclick = currentTab.getAttribute('onclick');
                if (onclick && onclick.includes('dashboard')) {
                    renderDashboard(vehicle);
                } else if (onclick && onclick.includes('refuel')) {
                    renderRefuelHistory(vehicle);
                }
            }
        } catch (refreshError) {
            Logger.error('Refuel', 'Failed to refresh view after save', {
                error: refreshError.message
            });
            // Page still works, just refresh whole app
            renderApp();
        }
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
        if (confirm("Opravdu smazat tento záznam?")) {
            Logger.info('Refuel', 'Deleting refuel', { refuelId: id });

            const success = DataManager.deleteRefuel(id);
            if (success) {
                showNotification("Záznam smazán");
                const activeVehicle = DataManager.getActiveVehicle();
                if (activeVehicle) {
                    renderRefuelHistory(activeVehicle);
                } else {
                    renderApp();
                }
            } else {
                showNotification("Chyba při mazání záznamu");
            }
        }
    } catch (e) {
        Logger.error('Refuel', 'Failed to delete refuel', {
            error: e.message,
            stack: e.stack,
            refuelId: id
        });
        showNotification('Chyba při mazání záznamu');
    }
}


function renderStats(vehicle) {
    const stats = DataManager.calculateStats(vehicle.id);
    const serviceCosts = DataManager.calculateServiceCosts(vehicle.id);
    const currency = DataManager.state.settings.currency;

    // Calculate total costs (fuel + service)
    const fuelCost = stats ? parseFloat(stats.totalCost) : 0;
    const totalCost = fuelCost + serviceCosts.total;

    const content = `
        <div class="card" style="margin-bottom: 16px;">
            <h2 class="card-title" style="margin-bottom: 20px;">
                <span class="material-symbols-outlined">equalizer</span>
                Podrobné statistiky
            </h2>

            ${stats ? `
            <h3 style="font-size: 1rem; margin: 16px 0 12px; color: var(--md-sys-color-primary);">Spotřeba paliva</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--md-sys-color-success);">${stats.minCons}</div>
                    <div class="stat-label">Nejlepší (l/100km)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--md-sys-color-error);">${stats.maxCons}</div>
                    <div class="stat-label">Nejhorší (l/100km)</div>
                </div>
            </div>

            <h3 style="font-size: 1rem; margin: 16px 0 12px; color: var(--md-sys-color-primary);">Sezónní spotřeba</h3>
            ${renderSeasonStat('Jaro', stats.seasonal.spring, currency)}
            ${renderSeasonStat('Léto', stats.seasonal.summer, currency)}
            ${renderSeasonStat('Podzim', stats.seasonal.autumn, currency)}
            ${renderSeasonStat('Zima', stats.seasonal.winter, currency)}
            ` : '<p style="color: var(--md-sys-color-outline);">Nedostatek dat pro statistiku spotřeby.</p>'}
        </div>

        <div class="card">
            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">payments</span>
                Celkové náklady
            </h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalCost.toLocaleString('cs-CZ')}</div>
                    <div class="stat-label">Celkem (${currency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${fuelCost.toLocaleString('cs-CZ')}</div>
                    <div class="stat-label">Palivo (${currency})</div>
                </div>
            </div>
            <div class="stats-grid" style="margin-top: 12px;">
                <div class="stat-card">
                    <div class="stat-value">${serviceCosts.total.toLocaleString('cs-CZ')}</div>
                    <div class="stat-label">Servis (${currency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${serviceCosts.count}</div>
                    <div class="stat-label">Servisních záznamů</div>
                </div>
            </div>
            ${serviceCosts.total > 0 ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--md-sys-color-outline-variant);">
                <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant);">Rozpis servisních nákladů:</h4>
                ${serviceCosts.byType.service > 0 ? `<div class="log-item"><span>Servis / Opravy</span><span>${serviceCosts.byType.service.toLocaleString('cs-CZ')} ${currency}</span></div>` : ''}
                ${serviceCosts.byType.vignette > 0 ? `<div class="log-item"><span>Dálniční známky</span><span>${serviceCosts.byType.vignette.toLocaleString('cs-CZ')} ${currency}</span></div>` : ''}
                ${serviceCosts.byType.insurance > 0 ? `<div class="log-item"><span>Pojištění</span><span>${serviceCosts.byType.insurance.toLocaleString('cs-CZ')} ${currency}</span></div>` : ''}
                ${serviceCosts.byType.inspection > 0 ? `<div class="log-item"><span>STK / Emise</span><span>${serviceCosts.byType.inspection.toLocaleString('cs-CZ')} ${currency}</span></div>` : ''}
                ${serviceCosts.byType.other > 0 ? `<div class="log-item"><span>Ostatní</span><span>${serviceCosts.byType.other.toLocaleString('cs-CZ')} ${currency}</span></div>` : ''}
            </div>
            ` : ''}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function renderSeasonStat(name, data, currency) {
    if (data.dist === 0) return '';
    const cons = (data.liters / data.dist * 100).toFixed(1);
    const cost = (data.cost / data.dist).toFixed(2);
    return `
        <div class="log-item">
            <div class="log-main">${name}</div>
            <div style="text-align: right;">
                <div class="log-value">${cons} l/100km</div>
                <div class="log-sub">${cost} ${currency}/km</div>
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
                return `
                <div class="car-item ${v.id === activeId ? 'active-car' : ''}" onclick="switchVehicle('${safeId}')">
                    <div>
                        <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
                            ${escapeHtml(v.name)}
                            ${v.id === activeId ? '<span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-primary);">check_circle</span>' : ''}
                        </div>
                        <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">
                            ${escapeHtml(v.manufacturer)} ${escapeHtml(v.type)} • ${escapeHtml(v.engine)}
                        </div>
                    </div>
                    <button class="button text-button" onclick="event.stopPropagation(); deleteCar('${safeId}')">
                        <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
                    </button>
                </div>
            `}).join('')}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

// === Service Tab ===
function renderService(vehicle) {
    const services = DataManager.getServices(vehicle.id);
    const expiring = DataManager.getExpiringServices(vehicle.id, 30);
    const expired = DataManager.getExpiredServices(vehicle.id);
    const costs = DataManager.calculateServiceCosts(vehicle.id);
    const currency = DataManager.state.settings.currency;
    const safeCurrency = escapeHtml(currency);

    // Group services by type for display
    const serviceTypes = {
        service: { label: 'Servis / Opravy', icon: 'build', items: [] },
        vignette: { label: 'Dálniční známky', icon: 'toll', items: [] },
        insurance: { label: 'Pojištění', icon: 'security', items: [] },
        inspection: { label: 'STK / Emise', icon: 'verified', items: [] },
        other: { label: 'Ostatní', icon: 'more_horiz', items: [] }
    };

    services.forEach(s => {
        if (serviceTypes[s.type]) {
            serviceTypes[s.type].items.push(s);
        } else {
            serviceTypes.other.items.push(s);
        }
    });

    // Alerts section
    let alertsHtml = '';
    if (expired.length > 0 || expiring.length > 0) {
        alertsHtml = `
            <div class="card" style="margin-bottom: 16px; border-left: 4px solid var(--md-sys-color-error);">
                <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-error); display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined">warning</span>
                    Upozornění
                </h3>
                ${expired.map(s => `
                    <div class="log-item" style="border-left: 3px solid var(--md-sys-color-error); padding-left: 12px; margin-bottom: 8px;">
                        <div>
                            <div class="log-main" style="color: var(--md-sys-color-error);">VYPRŠELO: ${escapeHtml(s.description)}</div>
                            <div class="log-sub">Platnost do: ${escapeHtml(formatDate(s.validUntil))}</div>
                        </div>
                    </div>
                `).join('')}
                ${expiring.map(s => {
                    const daysLeft = Math.ceil((new Date(s.validUntil) - new Date()) / (1000 * 60 * 60 * 24));
                    return `
                    <div class="log-item" style="border-left: 3px solid #ff9800; padding-left: 12px; margin-bottom: 8px;">
                        <div>
                            <div class="log-main" style="color: #ff9800;">Brzy vyprší: ${escapeHtml(s.description)}</div>
                            <div class="log-sub">Zbývá ${escapeHtml(daysLeft)} dní (do ${escapeHtml(formatDate(s.validUntil))})</div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
    }

    // Costs summary
    const costsHtml = `
        <div class="card" style="margin-bottom: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">payments</span>
                Celkové náklady na servis
            </h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(costs.total.toLocaleString('cs-CZ'))}</div>
                    <div class="stat-label">Celkem (${safeCurrency})</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(costs.count)}</div>
                    <div class="stat-label">Záznamů</div>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">
                ${costs.byType.service > 0 ? `<div>Servis/Opravy: ${escapeHtml(costs.byType.service.toLocaleString('cs-CZ'))} ${safeCurrency}</div>` : ''}
                ${costs.byType.vignette > 0 ? `<div>Dálniční známky: ${escapeHtml(costs.byType.vignette.toLocaleString('cs-CZ'))} ${safeCurrency}</div>` : ''}
                ${costs.byType.insurance > 0 ? `<div>Pojištění: ${escapeHtml(costs.byType.insurance.toLocaleString('cs-CZ'))} ${safeCurrency}</div>` : ''}
                ${costs.byType.inspection > 0 ? `<div>STK/Emise: ${escapeHtml(costs.byType.inspection.toLocaleString('cs-CZ'))} ${safeCurrency}</div>` : ''}
                ${costs.byType.other > 0 ? `<div>Ostatní: ${escapeHtml(costs.byType.other.toLocaleString('cs-CZ'))} ${safeCurrency}</div>` : ''}
            </div>
        </div>
    `;

    // Services list
    let servicesListHtml = '';
    Object.keys(serviceTypes).forEach(type => {
        const group = serviceTypes[type];
        if (group.items.length > 0) {
            servicesListHtml += `
                <div class="card" style="margin-bottom: 16px;">
                    <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-outlined">${group.icon}</span>
                        ${group.label}
                    </h3>
                    ${group.items.map(s => createServiceItem(s, currency)).join('')}
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
        ${alertsHtml}
        ${costsHtml}
        ${servicesListHtml}
    `;

    document.getElementById('mainContent').innerHTML = content;
    attachServiceSwipeListeners();
}

function createServiceItem(service, currency) {
    const hasValidity = service.validUntil;
    const isExpired = hasValidity && new Date(service.validUntil) < new Date();
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
                        ${escapeHtml(formatDate(service.date))}
                        ${service.odometer ? ` • ${escapeHtml(service.odometer)} km` : ''}
                        ${hasValidity ? ` • Platí do: ${escapeHtml(formatDate(service.validUntil))}` : ''}
                    </div>
                    ${service.note ? `<div class="log-sub" style="font-style: italic;">${escapeHtml(service.note)}</div>` : ''}
                </div>
                <div>
                    <div class="log-value">${service.cost ? escapeHtml(service.cost.toLocaleString('cs-CZ')) : '0'} ${safeCurrency}</div>
                </div>
            </div>
        </div>
    `;
}

// Global service swipe state
const serviceSwipeState = {
    isDragging: false,
    startX: 0,
    currentX: 0,
    activeContent: null,
    activeId: null
};

let serviceSwipeHandlersInitialized = false;

function initServiceSwipeHandlers() {
    if (serviceSwipeHandlersInitialized) return;
    serviceSwipeHandlersInitialized = true;

    window.addEventListener('mousemove', (e) => {
        if (!serviceSwipeState.isDragging || !serviceSwipeState.activeContent) return;
        serviceSwipeState.currentX = e.clientX - serviceSwipeState.startX;
        if (serviceSwipeState.currentX > 100) serviceSwipeState.currentX = 100;
        if (serviceSwipeState.currentX < -100) serviceSwipeState.currentX = -100;
        serviceSwipeState.activeContent.style.transform = `translateX(${serviceSwipeState.currentX}px)`;
    });

    window.addEventListener('mouseup', () => {
        if (serviceSwipeState.isDragging && serviceSwipeState.activeContent) {
            serviceSwipeState.isDragging = false;
            serviceSwipeState.activeContent.style.transition = 'transform 0.2s ease-out';
            handleServiceSwipeEnd(serviceSwipeState.activeContent, serviceSwipeState.currentX, serviceSwipeState.activeId);
            serviceSwipeState.currentX = 0;
            serviceSwipeState.activeContent = null;
            serviceSwipeState.activeId = null;
        }
    });
}

function attachServiceSwipeListeners() {
    initServiceSwipeHandlers();

    const items = document.querySelectorAll('.service-item:not([data-swipe-initialized])');
    items.forEach(item => {
        item.setAttribute('data-swipe-initialized', 'true');

        const content = item.querySelector('.swipe-content');
        const id = item.dataset.id;

        content.addEventListener('touchstart', (e) => {
            serviceSwipeState.startX = e.touches[0].clientX;
            serviceSwipeState.isDragging = true;
            serviceSwipeState.activeContent = content;
            serviceSwipeState.activeId = id;
            content.style.transition = 'none';
        });

        content.addEventListener('touchmove', (e) => {
            if (!serviceSwipeState.isDragging || serviceSwipeState.activeContent !== content) return;
            serviceSwipeState.currentX = e.touches[0].clientX - serviceSwipeState.startX;
            if (serviceSwipeState.currentX > 100) serviceSwipeState.currentX = 100;
            if (serviceSwipeState.currentX < -100) serviceSwipeState.currentX = -100;
            content.style.transform = `translateX(${serviceSwipeState.currentX}px)`;
        });

        content.addEventListener('touchend', () => {
            if (serviceSwipeState.activeContent !== content) return;
            serviceSwipeState.isDragging = false;
            content.style.transition = 'transform 0.2s ease-out';
            handleServiceSwipeEnd(content, serviceSwipeState.currentX, id);
            serviceSwipeState.currentX = 0;
            serviceSwipeState.activeContent = null;
            serviceSwipeState.activeId = null;
        });

        content.addEventListener('mousedown', (e) => {
            serviceSwipeState.startX = e.clientX;
            serviceSwipeState.isDragging = true;
            serviceSwipeState.activeContent = content;
            serviceSwipeState.activeId = id;
            content.style.transition = 'none';
        });
    });
}

function handleServiceSwipeEnd(element, distance, id) {
    if (distance > 50) {
        element.style.transform = 'translateX(0px)';
        openServiceModal(id);
    } else if (distance < -50) {
        element.style.transform = 'translateX(0px)';
        deleteServiceRecord(id);
    } else {
        element.style.transform = 'translateX(0px)';
    }
}

function openServiceModal(editId = null) {
    const activeVehicle = DataManager.getActiveVehicle();
    if (!activeVehicle) {
        showNotification('Vyberte nejprve vozidlo!');
        return;
    }

    const modalTitle = document.getElementById('serviceModalTitle');
    document.getElementById('serviceVehicleId').value = activeVehicle.id;

    if (editId) {
        const service = DataManager.getService(editId);
        if (!service) return;

        modalTitle.textContent = 'Upravit záznam';
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceType').value = service.type || 'service';
        document.getElementById('serviceDate').value = service.date;
        document.getElementById('serviceValidUntil').value = service.validUntil || '';
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceOdometer').value = service.odometer || '';
        document.getElementById('serviceCost').value = service.cost || '';
        document.getElementById('serviceNote').value = service.note || '';
    } else {
        modalTitle.textContent = 'Nový servisní záznam';
        document.getElementById('serviceId').value = '';
        document.getElementById('serviceType').value = 'service';
        document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('serviceValidUntil').value = '';
        document.getElementById('serviceDescription').value = '';
        document.getElementById('serviceOdometer').value = '';
        document.getElementById('serviceCost').value = '';
        document.getElementById('serviceNote').value = '';
    }

    onServiceTypeChange();
    document.getElementById('serviceModal').classList.add('active');
}

function onServiceTypeChange() {
    const type = document.getElementById('serviceType').value;
    const validUntilGroup = document.getElementById('serviceValidUntilGroup');
    const odoGroup = document.getElementById('serviceOdoGroup');

    // Show validity field for items that expire
    if (type === 'vignette' || type === 'insurance' || type === 'inspection') {
        validUntilGroup.style.display = 'block';
    } else {
        validUntilGroup.style.display = 'none';
    }

    // Odometer is optional for all but more relevant for service/inspection
    odoGroup.style.display = 'block';
}

function saveServiceRecord() {
    try {
        const id = document.getElementById('serviceId').value;
        const vehicleId = document.getElementById('serviceVehicleId').value;
        const type = document.getElementById('serviceType').value;
        const date = document.getElementById('serviceDate').value;
        const validUntil = document.getElementById('serviceValidUntil').value;
        const description = document.getElementById('serviceDescription').value;
        const odometer = document.getElementById('serviceOdometer').value;
        const cost = document.getElementById('serviceCost').value;
        const note = document.getElementById('serviceNote').value;

        if (!date) {
            showNotification('Zadejte datum');
            return;
        }

        if (!description) {
            showNotification('Zadejte popis záznamu');
            return;
        }

        const data = {
            id: id || null,
            vehicleId,
            type,
            date,
            validUntil: validUntil || null,
            description,
            odometer: odometer ? parseInt(odometer) : null,
            cost: cost ? parseFloat(cost) : 0,
            note: note || ''
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
        renderService(DataManager.getActiveVehicle());
    } catch (e) {
        Logger.error('Service', 'Failed to save service record', { error: e.message });
        showNotification('Chyba při ukládání');
    }
}

function deleteServiceRecord(id) {
    if (confirm('Opravdu smazat tento záznam?')) {
        const success = DataManager.deleteService(id);
        if (success) {
            showNotification('Záznam smazán');
            const activeVehicle = DataManager.getActiveVehicle();
            if (activeVehicle) {
                renderService(activeVehicle);
            }
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
                                Poslední sync: ${CloudSync.getSyncStatus().lastSyncFormatted}
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
                         <span>Importovat data</span>
                         <span class="material-symbols-outlined">upload</span>
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
                <div class="settings-group" onclick="clearLogs()">
                    <div class="settings-item">
                         <span style="color: var(--md-sys-color-error);">Smazat logy</span>
                         <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
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
function openCarModal(id) {
    document.getElementById('carModal').classList.add('active');
    document.getElementById('carName').value = '';
    document.getElementById('carMaker').value = '';
    document.getElementById('carType').value = '';
    document.getElementById('carEngine').value = '';
    document.getElementById('carTank').value = '';
    document.getElementById('carId').value = '';
    document.getElementById('carModalTitle').textContent = 'Nové auto';
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
    const id = document.getElementById('carId').value;

    if (!name) {
        showNotification('Zadejte název auta.');
        return;
    }

    // Validate tank size
    let tankSize = null;
    if (tankStr) {
        tankSize = parseInt(tankStr);
        if (isNaN(tankSize) || tankSize < 1) {
            showNotification('Zadejte platný objem nádrže (min. 1 l).');
            return;
        }
        if (tankSize > 500) {
            showNotification('Objem nádrže je příliš velký (max. 500 l).');
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
        isDefault: false
    });

    closeModal('carModal');
    showNotification('Auto uloženo!');
    renderApp(); // Refresh all
}

function deleteCar(id) {
    if (confirm("Opravdu smazat toto auto a všechna jeho data?")) {
        DataManager.deleteVehicle(id);
        renderApp();
        showNotification("Auto smazáno.");
    }
}

// === Settings Logic ===
function toggleDarkMode() {
    DataManager.state.settings.darkMode = !DataManager.state.settings.darkMode;
    DataManager.save();
    DataManager.applySettings();
    renderApp();
}

function toggleAutoDarkMode() {
    DataManager.state.settings.darkModeAuto = !DataManager.state.settings.darkModeAuto;
    Logger.info('Settings', 'Auto dark mode toggled', {
        enabled: DataManager.state.settings.darkModeAuto
    });
    DataManager.save();
    DataManager.applySettings();
    renderApp();
}

function exportData() {
    const dataStr = JSON.stringify(DataManager.state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "fuel_tracker_backup.json";
    a.click();
}

function exportCSV() {
    try {
        Logger.info('Settings', 'Exporting data to CSV');

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

        // CSV Header
        const headers = [
            'Datum',
            'Stav tachometru (km)',
            'Natankováno (l)',
            'Cena za litr (Kč)',
            'Celková cena (Kč)',
            'Plná nádrž',
            'Poznámka',
            'Spotřeba (l/100km)',
            'Ujetá vzdálenost (km)'
        ];

        // Build CSV rows
        const rows = [headers.join(',')];

        refuels.forEach((refuel, index) => {
            // Calculate consumption and distance if possible
            let consumption = '';
            let distance = '';

            if (index < refuels.length - 1 && refuel.isFullTank) {
                const prevRefuel = refuels[index + 1];
                distance = refuel.odometer - prevRefuel.odometer;
                if (distance > 0) {
                    consumption = ((refuel.liters / distance) * 100).toFixed(1);
                }
            }

            const row = [
                formatDate(refuel.date),
                refuel.odometer,
                refuel.liters.toFixed(2),
                refuel.pricePerLiter.toFixed(2),
                refuel.totalPrice.toFixed(2),
                refuel.isFullTank ? 'Ano' : 'Ne',
                `"${(refuel.notes || '').replace(/"/g, '""')}"`, // Escape quotes
                consumption,
                distance
            ];

            rows.push(row.join(','));
        });

        // Create CSV content
        const csvContent = rows.join('\n');

        // Add BOM for Excel UTF-8 support
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `fuel_tracker_${activeVehicle.name}_${Date.now()}.csv`;
        a.click();

        URL.revokeObjectURL(url);

        Logger.info('Settings', 'CSV export successful', {
            vehicleName: activeVehicle.name,
            rowsCount: refuels.length
        });

        showNotification('CSV exportován');
    } catch (e) {
        Logger.error('Settings', 'Failed to export CSV', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při exportu CSV');
    }
}

function importData() {
    try {
        Logger.info('Settings', 'Starting data import');

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            try {
                const file = e.target.files[0];
                if (!file) {
                    Logger.warn('Settings', 'No file selected for import');
                    return;
                }

                Logger.info('Settings', 'Reading import file', {
                    fileName: file.name,
                    fileSize: file.size
                });

                const reader = new FileReader();
                reader.onload = ev => {
                    try {
                        const data = JSON.parse(ev.target.result);

                        // Validate imported data structure
                        if (!data.vehicles || !data.refuels || !data.settings) {
                            throw new Error('Invalid data structure');
                        }

                        Logger.info('Settings', 'Importing data', {
                            vehiclesCount: data.vehicles.length,
                            refuelsCount: data.refuels.length
                        });

                        DataManager.state = data;
                        DataManager.save();
                        DataManager.applySettings();
                        renderApp();
                        showNotification("Data úspěšně obnovena!");

                        Logger.info('Settings', 'Data import successful');
                    } catch (err) {
                        Logger.error('Settings', 'Failed to parse import file', {
                            error: err.message,
                            stack: err.stack
                        });
                        showNotification("Chyba: Neplatný formát souboru.");
                    }
                };

                reader.onerror = () => {
                    Logger.error('Settings', 'Failed to read import file', {
                        error: reader.error
                    });
                    showNotification("Chyba při čtení souboru.");
                };

                reader.readAsText(file);
            } catch (err) {
                Logger.error('Settings', 'Error in file selection handler', {
                    error: err.message,
                    stack: err.stack
                });
                showNotification("Chyba při importu dat.");
            }
        };
        input.click();
    } catch (e) {
        Logger.error('Settings', 'Failed to initiate data import', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při importu dat');
    }
}

// === Utils ===
function showNotification(msg) {
    const el = document.getElementById('notification');
    document.getElementById('notificationMessage').textContent = msg;
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 3000);
}

function formatDate(isoDate) {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

// === Log Management Functions ===
function viewLogs() {
    try {
        Logger.info('Settings', 'Viewing logs');

        const allLogs = Logger.logs;
        const errorLogs = Logger.getPersistedErrors();

        let logsHtml = '';

        if (allLogs.length === 0 && errorLogs.length === 0) {
            logsHtml = '<p style="text-align: center; color: var(--md-sys-color-outline); padding: 20px;">Žádné logy k zobrazení</p>';
        } else {
            // Show persisted errors first
            if (errorLogs.length > 0) {
                logsHtml += '<h3 style="font-size: 0.9rem; margin: 12px 0; color: var(--md-sys-color-error);">Uložené chyby</h3>';
                errorLogs.slice().reverse().forEach(log => {
                    logsHtml += formatLogEntry(log);
                });
            }

            // Show recent logs
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
                    <button class="button text-button" onclick="renderSettings()">
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
        Logger.error('Settings', 'Failed to view logs', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při zobrazení logů');
    }
}

function formatLogEntry(log) {
    const levelColors = {
        DEBUG: 'var(--md-sys-color-outline)',
        INFO: 'var(--md-sys-color-primary)',
        WARN: '#ff9800',
        ERROR: 'var(--md-sys-color-error)',
        FATAL: '#b71c1c'
    };

    const color = levelColors[log.level] || 'var(--md-sys-color-on-surface)';
    const time = new Date(log.timestamp).toLocaleTimeString('cs-CZ');
    const date = new Date(log.timestamp).toLocaleDateString('cs-CZ');

    return `
        <div class="log-item" style="border-left: 3px solid ${color}; margin-bottom: 8px; padding-left: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div class="log-main" style="color: ${color}; font-weight: 500;">
                        [${log.level}] ${log.category}
                    </div>
                    <div class="log-sub">${log.message}</div>
                    ${log.data ? `<pre style="font-size: 0.7rem; margin: 4px 0 0 0; color: var(--md-sys-color-outline); overflow-x: auto;">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
                </div>
                <div class="log-sub" style="text-align: right; white-space: nowrap;">
                    ${date}<br>${time}
                </div>
            </div>
        </div>
    `;
}

function exportLogs() {
    try {
        Logger.info('Settings', 'Exporting logs');
        Logger.exportLogs();
        showNotification('Logy exportovány');
    } catch (e) {
        Logger.error('Settings', 'Failed to export logs', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při exportu logů');
    }
}

function clearLogs() {
    try {
        if (confirm('Opravdu smazat všechny logy?')) {
            Logger.info('Settings', 'Clearing logs');
            Logger.clearLogs();
            Logger.clearPersistedErrors();
            showNotification('Logy smazány');
            renderSettings();
        }
    } catch (e) {
        Logger.error('Settings', 'Failed to clear logs', {
            error: e.message,
            stack: e.stack
        });
        showNotification('Chyba při mazání logů');
    }
}

// === Cloud Sync Functions ===
function toggleCloudSync(checkbox) {
    DataManager.updateSettings({ cloudSync: checkbox.checked });
    Logger.info('Settings', 'Cloud sync toggled', { enabled: checkbox.checked });

    if (checkbox.checked && typeof CloudSync !== 'undefined') {
        showNotification('Synchronizuji...');
        CloudSync.fullSync().then(result => {
            if (result.success) {
                showNotification('Data synchronizována');
                renderSettings();
            } else {
                showNotification('Chyba synchronizace: ' + result.error);
            }
        });
    }
}

async function syncNow() {
    if (typeof CloudSync === 'undefined') {
        showNotification('Cloud sync není dostupný');
        return;
    }

    showNotification('Synchronizuji...');
    const result = await CloudSync.fullSync();

    if (result.success) {
        showNotification('Data synchronizována');
        renderApp();
    } else {
        showNotification('Chyba: ' + result.error);
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
                <button class="button text-button" onclick="renderSettings()">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <p style="margin-bottom: 16px; color: var(--md-sys-color-on-surface-variant);">
                Toto ID použijte pro obnovení dat na jiném zařízení.
            </p>
            <div style="background: var(--md-sys-color-surface-variant); padding: 16px; border-radius: 12px; word-break: break-all; font-family: monospace; margin-bottom: 16px;">
                ${status.userId}
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
        if (success) {
            showNotification('ID zkopírováno do schránky');
        } else {
            showNotification('Nepodařilo se zkopírovat');
        }
    }
}

async function restoreFromId() {
    if (typeof CloudSync === 'undefined') {
        showNotification('Cloud sync není dostupný');
        return;
    }

    const userId = prompt('Zadejte Sync ID z jiného zařízení:');
    if (!userId) return;

    if (!userId.startsWith('fuel_')) {
        showNotification('Neplatné Sync ID');
        return;
    }

    if (CloudSync.setUserId(userId)) {
        showNotification('Stahuji data...');
        const result = await CloudSync.pullFromCloud();

        if (result.success && result.data) {
            CloudSync.mergeData(result.data);
            showNotification('Data úspěšně obnovena!');
            renderApp();
        } else if (result.success && !result.data) {
            showNotification('Pro toto ID nebyla nalezena žádná data');
        } else {
            showNotification('Chyba: ' + result.error);
        }
    } else {
        showNotification('Neplatné Sync ID');
    }
}
