"""
Optional end-to-end test in a real browser.

    pip install playwright && playwright install chromium
    python -m http.server 8765        (in the project folder)
    python tests/e2e_playwright.py

Env FT_BASE overrides the URL, FT_OUT the folder for screenshots.
"""
import json, datetime, sys, re, os, tempfile
from playwright.sync_api import sync_playwright

BASE = os.environ.get("FT_BASE", "http://localhost:8765/index.html")
OUT = os.environ.get("FT_OUT", tempfile.gettempdir())
results = []
errors = []

def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  OK  " if cond else "  FAIL") + " " + name + (("  -> " + str(detail)) if detail and not cond else ""))

today = datetime.date.today().isoformat()

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, accept_downloads=True, locale="cs-CZ")
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append("console.error: " + m.text) if m.type == "error" else None)
    dialogs = []
    flags = {"dismiss_next": False, "prompt": ""}
    def on_dialog(d):
        dialogs.append(d.message)
        if d.type == "prompt":
            d.accept(flags["prompt"])
        elif flags["dismiss_next"]:
            flags["dismiss_next"] = False
            d.dismiss()
        else:
            d.accept()
    page.on("dialog", on_dialog)

    page.goto(BASE)
    page.wait_for_timeout(800)
    page.evaluate("window.__marker = 'no-reload'")
    check("verze 2.8.0 v hlavičce", page.inner_text("#appVersion") == "v2.8.0")

    # Vehicle rename (XSS in name)
    page.locator("button[data-tab=garage]").dispatch_event("click")
    page.click("text=Upravit >> nth=0") if page.locator("text=Upravit").count() else None
    page.locator(".car-item button[title=Upravit]").first.click()
    page.fill("#carName", "<img src=x onerror=window.__xss=1>Octavia")
    page.fill("#carTank", "50")
    page.click("#carModal .filled-button")
    page.wait_for_timeout(300)
    check("zůstává v Garáži po uložení auta", page.locator("button[data-tab=garage].active").count() == 1)
    check("XSS ve jménu auta se nespustí", page.evaluate("window.__xss") is None)

    # Refuel 1 - total from receipt
    page.locator("button[data-tab=dashboard]").dispatch_event("click")
    page.click(".fab-main")
    check("datum předvyplněno dnešním lokálním datem", page.input_value("#refuelDate") == today, page.input_value("#refuelDate"))
    page.fill("#refuelOdo", "10000")
    page.fill("#refuelLiters", "40")
    page.fill("#refuelTotal", "1400")
    check("cena za litr dopočítaná z účtenky", page.input_value("#refuelPrice") == "35", page.input_value("#refuelPrice"))
    page.click("#refuelModal .filled-button")
    page.wait_for_timeout(300)

    # Refuel 2 - decimal comma, price input, recalculated total
    page.click(".fab-main")
    page.fill("#refuelOdo", "10600")
    page.fill("#refuelLiters", "36,5")
    page.fill("#refuelPrice", "36,90")
    check("celková cena z litrů×ceny (desetinná čárka)", page.input_value("#refuelTotal") == "1346.85", page.input_value("#refuelTotal"))
    page.click("#refuelModal .filled-button")
    page.wait_for_timeout(300)
    check("modal zavřen po uložení", page.locator("#refuelModal.active").count() == 0)
    txt = page.inner_text("#mainContent")
    check("spotřeba 6,1 l/100km na přehledu", "6,1" in txt, txt[:400])

    # Refuel 3 - more than tank -> confirm; odometer jump -> confirm
    dialogs.clear()
    page.click(".fab-main")
    page.fill("#refuelOdo", "13000")
    page.fill("#refuelLiters", "52")
    page.fill("#refuelPrice", "36")
    page.click("#refuelModal .filled-button")
    page.wait_for_timeout(300)
    check("varování: víc než objem nádrže (potvrzení)", any("objem nádrže" in d for d in dialogs), dialogs)
    check("varování: velký skok tachometru (potvrzení)", any("Je stav tachometru" in d for d in dialogs), dialogs)

    # duplicate odometer rejected
    page.click(".fab-main")
    page.fill("#refuelOdo", "13000")
    page.fill("#refuelLiters", "30")
    page.fill("#refuelPrice", "36")
    page.click("#refuelModal .filled-button")
    page.wait_for_timeout(200)
    check("duplicitní stav tachometru odmítnut", "už existuje" in page.inner_text("#notificationMessage"), page.inner_text("#notificationMessage"))
    page.click("#refuelModal .text-button")

    # tap to edit
    page.locator("button[data-tab=refuel]").dispatch_event("click")
    page.locator(".refuel-item .swipe-content").first.click()
    page.wait_for_timeout(200)
    check("klepnutí na záznam otevře úpravu", page.locator("#refuelModal.active").count() == 1 and page.inner_text("#refuelModalTitle") == "Upravit tankování")
    page.click("#refuelModal .text-button")

    # swipe left with mouse -> delete confirm (dismiss)
    dialogs.clear()
    flags["dismiss_next"] = True
    box = page.locator(".refuel-item .swipe-content").first.bounding_box()
    page.mouse.move(box["x"] + box["width"] - 20, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.mouse.move(box["x"] + box["width"] - 150, box["y"] + box["height"] / 2, steps=8)
    page.mouse.up()
    page.wait_for_timeout(300)
    check("swipe doleva nabídne smazání", any("smazat" in d for d in dialogs), dialogs)
    check("po zrušení mazání zůstává záznam a záložka Tankování", page.locator(".refuel-item").count() == 3 and page.locator("button[data-tab=refuel].active").count() == 1)
    check("po swipe se neotevřela úprava", page.locator("#refuelModal.active").count() == 0)

    # Stats
    page.locator("button[data-tab=stats]").dispatch_event("click")
    page.wait_for_timeout(1200)
    st = page.inner_text("#mainContent")
    check("statistiky: palivo celkem vč. prvního tankování", "4" in st and ("4 618" in st or "4 619" in st or "4 619" in st or "4 618" in st), st[:600])
    check("grafy vykresleny", page.locator("canvas").count() >= 2)

    # Service - vignette ending today
    page.locator("button[data-tab=service]").dispatch_event("click")
    page.click(".fab-main")
    page.select_option("#serviceType", "vignette")
    page.fill("#serviceDescription", "Dálniční známka 2026")
    page.fill("#serviceDate", (datetime.date.today() - datetime.timedelta(days=364)).isoformat())
    page.fill("#serviceValidUntil", today)
    page.fill("#serviceCost", "2440")
    page.click("#serviceModal .filled-button")
    page.wait_for_timeout(300)
    page.click(".fab-main")
    page.select_option("#serviceType", "service")
    check("pole 'Příští servis při km' viditelné pro servis", page.is_visible("#serviceNextOdometer"))
    page.fill("#serviceDescription", "Výměna oleje")
    page.fill("#serviceOdometer", "5000")
    page.fill("#serviceNextOdometer", "13500")
    page.click("#serviceModal .filled-button")
    page.wait_for_timeout(300)
    page.locator("button[data-tab=dashboard]").dispatch_event("click")
    dash = page.inner_text("#mainContent")
    check("přehled: známka platí dnes naposledy (ne VYPRŠELO)", "dnes platí naposledy" in dash and "VYPRŠELO" not in dash, dash[:500])
    check("přehled: servis za 500 km", "Servis za 500 km" in dash, dash[:500])

    # Settings: dark mode toggle stays
    page.locator("button[data-tab=settings]").dispatch_event("click")
    page.locator(".settings-item:has-text('Auto tmavý režim') .slider").click()
    page.wait_for_timeout(300)
    check("přepnutí tmavého režimu nechá uživatele v Nastavení", page.locator("button[data-tab=settings].active").count() == 1 and "Nastavení" in page.inner_text("#mainContent"))

    # CSV export
    with page.expect_download() as dl:
        page.click("text=Exportovat do CSV")
    path = dl.value.path()
    raw = open(path, "rb").read().decode("utf-8")
    check("CSV: BOM, středníky, desetinná čárka", raw.startswith("﻿") and ";" in raw and "36,50" in raw, raw[:200])

    # JSON export
    with page.expect_download() as dl2:
        page.click("text=Exportovat data (JSON)")
    exported = json.load(open(dl2.value.path(), encoding="utf-8"))
    check("JSON export obsahuje data a tombstones", len(exported["refuels"]) == 3 and "deleted" in exported)

    # Import (modify file) with confirmations
    exported["refuels"] = exported["refuels"][:1]
    exported["_syncId"] = "fuel_" + "a" * 32
    imp = OUT + "/import.json"
    json.dump(exported, open(imp, "w"))
    dialogs.clear()
    with page.expect_file_chooser() as fc:
        page.click("text=Importovat data")
    fc.value.set_files(imp)
    page.wait_for_timeout(800)
    check("import se nejdřív zeptá", any("Import přepíše" in d for d in dialogs), dialogs)
    check("import se zeptá na cizí Sync ID", any("jiné Sync ID" in d for d in dialogs), dialogs)
    n = page.evaluate("DataManager.state.refuels.length")
    check("import proveden", n == 1, n)
    backups = page.evaluate("DataManager.listBackups().length")
    check("před importem vznikla záloha", backups >= 1, backups)

    # Restore backup back
    page.locator("button[data-tab=settings]").dispatch_event("click")
    page.click("text=Zálohy v zařízení")
    page.wait_for_timeout(200)
    page.locator("text=Obnovit").first.click()
    page.wait_for_timeout(500)
    n2 = page.evaluate("DataManager.state.refuels.length")
    check("obnova ze zálohy vrátí 3 tankování", n2 == 3, n2)

    # Logs view escaping
    page.evaluate("Logger.error('Test', '<img src=x onerror=window.__xss2=1>', {note: '<script>window.__xss3=1</script>'})")
    page.locator("button[data-tab=settings]").dispatch_event("click")
    page.click("text=Zobrazit logy")
    page.wait_for_timeout(300)
    check("logy: HTML se neinterpretuje", page.evaluate("window.__xss2") is None and "<img src=x" in page.inner_text("#mainContent"))

    # Sync ID shows / zoom allowed
    vp = page.get_attribute("meta[name=viewport]", "content")
    check("zoom povolen", "user-scalable=no" not in vp)

    page.screenshot(path=OUT + "/settings.png", full_page=True)
    page.locator("button[data-tab=dashboard]").dispatch_event("click")
    page.wait_for_timeout(300)
    page.screenshot(path=OUT + "/dashboard.png", full_page=True)
    page.click(".fab-main")
    page.wait_for_timeout(400)
    page.screenshot(path=OUT + "/refuel_modal.png")
    page.click("#refuelModal .text-button")

    # SW registered and no auto reload happened
    page.wait_for_timeout(1500)
    sw = page.evaluate("navigator.serviceWorker.controller !== null || navigator.serviceWorker.getRegistrations().then(r => r.length)")
    check("service worker registrován", sw)
    check("stránka se sama nereloadovala", page.evaluate("window.__marker") == "no-reload")

    # Old-version data migration
    page2 = ctx.new_page()
    page2.on("pageerror", lambda e: errors.append("page2: " + str(e)))
    page2.on("dialog", lambda d: d.accept())
    page2.goto(BASE)
    page2.evaluate("""() => {
        localStorage.clear();
        localStorage.setItem('fuelTrackerData', JSON.stringify({
            version: '2.4.0',
            vehicles: [{id: 'mkabc123', name: 'Staré auto', tankSize: 50}],
            refuels: [
              {id: 'r1abc', vehicleId: 'mkabc123', date: '2026-01-01', odometer: 1000, liters: 40, pricePerLiter: 35, totalPrice: 1400, isFullTank: true},
              {id: 'r2abc', vehicleId: 'mkabc123', date: '2026-01-10', odometer: 1600, liters: 36, pricePerLiter: 35, totalPrice: 1260, isFullTank: true}
            ],
            services: [],
            settings: {darkMode: false, darkModeAuto: true, currency: 'Kč', activeVehicleId: 'mkabc123', minPrice: 25, maxPrice: 45}
        }));
    }""")
    page2.reload()
    page2.wait_for_timeout(800)
    s = page2.evaluate("DataManager.state.settings")
    check("migrace starých dat: limit 15-55, cloudSync doplněn", s["minPrice"] == 15 and s["maxPrice"] == 55 and s["cloudSync"] is False, s)
    check("migrace: spotřeba 6,0 na přehledu", "6,0" in page2.inner_text("#mainContent"))

    browser.close()

real_errors = [e for e in errors if "[ERROR] Test:" not in e and "fonts.g" not in e and "net::ERR" not in e and "Failed to load resource" not in e]
check("žádné JS chyby v konzoli", not real_errors, real_errors[:5])
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} E2E kontrol prošlo")
sys.exit(1 if failed else 0)
