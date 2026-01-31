/**
 * Test suite for consumption calculation algorithm (v2.7.0)
 *
 * This validates the accumulation algorithm against known scenarios
 */

// Mock Logger for testing
const Logger = {
    info: (...args) => console.log('[INFO]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};

// Simplified version of the algorithm for testing
function calculateConsumptionForRefuels(refuels) {
    const logs = [...refuels].sort((a, b) => a.odometer - b.odometer); // Oldest first
    const consumptionMap = {};

    if (logs.length < 2) {
        logs.forEach(log => {
            consumptionMap[log.id] = null;
        });
        return consumptionMap;
    }

    consumptionMap[logs[0].id] = null;

    let lastFullTankIndex = -1;
    for (let i = 0; i < logs.length; i++) {
        if (logs[i].isFullTank) {
            lastFullTankIndex = i;
            break;
        }
    }

    if (lastFullTankIndex === -1) {
        logs.forEach(log => {
            consumptionMap[log.id] = null;
        });
        return consumptionMap;
    }

    for (let i = lastFullTankIndex + 1; i < logs.length; i++) {
        const current = logs[i];

        if (current.isFullTank) {
            const previousFullTank = logs[lastFullTankIndex];
            const distance = current.odometer - previousFullTank.odometer;

            let totalLiters = 0;
            for (let j = lastFullTankIndex + 1; j <= i; j++) {
                totalLiters += parseFloat(logs[j].liters) || 0;
            }

            if (distance > 0 && distance < 5000 && totalLiters > 0) {
                const consumption = (totalLiters / distance) * 100;

                if (consumption >= 1 && consumption <= 50) {
                    const consumptionValue = parseFloat(consumption.toFixed(1));

                    for (let j = lastFullTankIndex + 1; j <= i; j++) {
                        consumptionMap[logs[j].id] = consumptionValue;
                    }
                } else {
                    for (let j = lastFullTankIndex + 1; j <= i; j++) {
                        consumptionMap[logs[j].id] = null;
                    }
                }
            } else {
                for (let j = lastFullTankIndex + 1; j <= i; j++) {
                    consumptionMap[logs[j].id] = null;
                }
            }

            lastFullTankIndex = i;
        } else {
            if (!consumptionMap.hasOwnProperty(current.id)) {
                consumptionMap[current.id] = null;
            }
        }
    }

    return consumptionMap;
}

// Test scenarios
console.log('=== TEST 1: Two full tanks (standard scenario) ===');
const test1 = [
    { id: 'r1', odometer: 1000, liters: 40, isFullTank: true },
    { id: 'r2', odometer: 1500, liters: 30, isFullTank: true }
];
const result1 = calculateConsumptionForRefuels(test1);
console.log('Expected: r1=null, r2=6.0 (30L / 500km * 100)');
console.log('Result:', result1);
console.log('✓ PASS:', result1.r1 === null && result1.r2 === 6.0);
console.log('');

console.log('=== TEST 2: Full tank → Partial → Full tank (accumulation) ===');
const test2 = [
    { id: 'r1', odometer: 1000, liters: 40, isFullTank: true },
    { id: 'r2', odometer: 1250, liters: 15, isFullTank: false }, // Partial
    { id: 'r3', odometer: 1500, liters: 15, isFullTank: true }
];
const result2 = calculateConsumptionForRefuels(test2);
console.log('Expected: r1=null, r2=6.0, r3=6.0 ((15+15)L / 500km * 100)');
console.log('Result:', result2);
console.log('✓ PASS:', result2.r1 === null && result2.r2 === 6.0 && result2.r3 === 6.0);
console.log('');

console.log('=== TEST 3: Multiple partials between full tanks ===');
const test3 = [
    { id: 'r1', odometer: 1000, liters: 50, isFullTank: true },
    { id: 'r2', odometer: 1200, liters: 10, isFullTank: false }, // Partial
    { id: 'r3', odometer: 1400, liters: 10, isFullTank: false }, // Partial
    { id: 'r4', odometer: 1600, liters: 10, isFullTank: false }, // Partial
    { id: 'r5', odometer: 1800, liters: 12, isFullTank: true }   // Full tank
];
const result3 = calculateConsumptionForRefuels(test3);
const expected3 = ((10 + 10 + 10 + 12) / 800) * 100; // 42L / 800km = 5.25 l/100km
console.log('Expected: r1=null, r2-r5=5.3 ((10+10+10+12)L / 800km * 100)');
console.log('Result:', result3);
console.log('✓ PASS:', result3.r1 === null && result3.r2 === 5.3 && result3.r3 === 5.3 && result3.r4 === 5.3 && result3.r5 === 5.3);
console.log('');

console.log('=== TEST 4: No full tanks (cannot calculate) ===');
const test4 = [
    { id: 'r1', odometer: 1000, liters: 20, isFullTank: false },
    { id: 'r2', odometer: 1200, liters: 15, isFullTank: false }
];
const result4 = calculateConsumptionForRefuels(test4);
console.log('Expected: r1=null, r2=null (no full tanks)');
console.log('Result:', result4);
console.log('✓ PASS:', result4.r1 === null && result4.r2 === null);
console.log('');

console.log('=== TEST 5: Partial refuels at the end (waiting for full tank) ===');
const test5 = [
    { id: 'r1', odometer: 1000, liters: 40, isFullTank: true },
    { id: 'r2', odometer: 1500, liters: 30, isFullTank: true },
    { id: 'r3', odometer: 1700, liters: 10, isFullTank: false }, // Partial (waiting)
    { id: 'r4', odometer: 1900, liters: 10, isFullTank: false }  // Partial (waiting)
];
const result5 = calculateConsumptionForRefuels(test5);
console.log('Expected: r1=null, r2=6.0, r3=null, r4=null (waiting for next full tank)');
console.log('Result:', result5);
console.log('✓ PASS:', result5.r1 === null && result5.r2 === 6.0 && result5.r3 === null && result5.r4 === null);
console.log('');

console.log('=== TEST 6: Real-world scenario ===');
const test6 = [
    { id: 'r1', odometer: 50000, liters: 45, isFullTank: true },  // Start
    { id: 'r2', odometer: 50600, liters: 35, isFullTank: true },  // 600km, 35L = 5.83 l/100km
    { id: 'r3', odometer: 50900, liters: 20, isFullTank: false }, // Partial
    { id: 'r4', odometer: 51200, liters: 15, isFullTank: true }   // Full (600km from r2, 35L total)
];
const result6 = calculateConsumptionForRefuels(test6);
const expected6_r2 = ((35) / 600) * 100; // 5.8
const expected6_r4 = ((20 + 15) / 600) * 100; // 5.8
console.log('Expected: r1=null, r2=5.8, r3=5.8, r4=5.8');
console.log('Result:', result6);
console.log('✓ PASS:', result6.r1 === null && result6.r2 === 5.8 && result6.r3 === 5.8 && result6.r4 === 5.8);
console.log('');

console.log('=== ALL TESTS COMPLETED ===');
