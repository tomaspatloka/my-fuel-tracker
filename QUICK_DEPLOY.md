# 🚀 Rychlý Deploy na Cloudflare Pages

## ✅ METODA 1: Přes GitHub (DOPORUČENO)

### Krok 1: Vytvořte GitHub Repository

1. Jděte na: https://github.com/new
2. Název repository: `my-fuel-tracker` (nebo jakýkoliv jiný)
3. **DŮLEŽITÉ:** Dejte **Public** nebo **Private** (vaše volba)
4. **NEINICIALIZUJTE** (žádné README, gitignore - už to máte!)
5. Klikněte: **Create repository**

### Krok 2: Push kódu na GitHub

Otevřete terminál/CMD ve složce `MyFuelTracker` a spusťte:

```bash
# 1. Ujistěte se, že jste ve správné složce
cd C:\Users\tpatl\Desktop\MyFuelTracker

# 2. Zkontrolujte Git status
git status

# 3. Připojte GitHub repository (nahraďte USERNAME)
git remote add origin https://github.com/USERNAME/my-fuel-tracker.git

# 4. Push na GitHub
git branch -M main
git push -u origin main
```

**Pokud Git žádá credentials:**
```bash
# Nastavte jméno a email
git config --global user.name "Vaše Jméno"
git config --global user.email "vas@email.com"

# Zkuste push znovu
git push -u origin main
```

### Krok 3: Připojte GitHub k Cloudflare

1. Jděte na: https://dash.cloudflare.com/
2. Klikněte: **Workers & Pages** (levé menu)
3. Klikněte: **Create application**
4. Vyberte: **Pages**
5. Klikněte: **Connect to Git**

### Krok 4: Autorizujte GitHub

1. Vyberte: **GitHub**
2. Autorizujte Cloudflare Pages
3. Vyberte repository: **my-fuel-tracker**
4. Klikněte: **Begin setup**

### Krok 5: Nastavte Build Configuration

**DŮLEŽITÉ - Správné nastavení:**

```
Project name: my-fuel-tracker

Production branch: main

Build settings:
┌────────────────────────────────────┐
│ Framework preset: None             │
│                                     │
│ Build command:                      │
│ [PONECHTE PRÁZDNÉ - nic nepište]  │
│                                     │
│ Build output directory: /           │
│                                     │
│ Root directory (optional):          │
│ [PONECHTE PRÁZDNÉ]                 │
└────────────────────────────────────┘

Environment variables (production):
[Žádné nejsou potřeba - ponechte prázdné]
```

### Krok 6: Deploy!

1. Klikněte: **Save and Deploy**
2. Čekejte 1-2 minuty
3. ✅ **Hotovo!**

Vaše aplikace poběží na:
```
https://my-fuel-tracker.pages.dev
```

---

## 🔧 METODA 2: Přes Wrangler CLI (Přímý upload)

Pokud nechcete používat GitHub, můžete nahrát soubory přímo.

### Krok 1: Nainstalujte Wrangler

```bash
npm install -g wrangler
```

### Krok 2: Login do Cloudflare

```bash
wrangler login
```

### Krok 3: Deploy

```bash
cd C:\Users\tpatl\Desktop\MyFuelTracker
wrangler pages deploy . --project-name=my-fuel-tracker
```

**První deploy vytvoří projekt a nahraje soubory.**

---

## 🐛 Řešení problémů

### "Assets have not yet been deployed"

To znamená, že Cloudflare čeká na soubory. **Řešení:**

1. **Pokud jste použili "Connect to Git":**
   - Ujistěte se, že jste pushli kód na GitHub
   - V Cloudflare Pages klikněte: **Retry deployment**

2. **Pokud jste použili Wrangler:**
   - Zkontrolujte že příkaz proběhl úspěšně
   - Zkuste deploy znovu

### Build Failed

**Problém:** Build settings jsou špatně
**Řešení:**

```
Framework: None (ne React, ne Next.js!)
Build command: (PRÁZDNÉ - žádný build není potřeba)
Output directory: / (lomítko)
```

### Git Push nefunguje

**Problém:** Authentication failed
**Řešení:**

```bash
# Vygenerujte Personal Access Token na GitHubu:
# 1. GitHub → Settings → Developer settings
# 2. Personal access tokens → Tokens (classic)
# 3. Generate new token
# 4. Scope: repo (zaškrtněte)
# 5. Zkopírujte token

# Použijte token jako heslo při push
git push -u origin main
Username: your-github-username
Password: [VLOŽTE TOKEN, NE HESLO]
```

### Cannot find module 'wrangler'

**Problém:** Wrangler není nainstalován globálně
**Řešení:**

```bash
npm install -g wrangler

# Nebo použijte npx:
npx wrangler pages deploy . --project-name=my-fuel-tracker
```

---

## ✅ Checklist po nasazení

Po úspěšném nasazení zkontrolujte:

- [ ] URL funguje (https://my-fuel-tracker.pages.dev)
- [ ] Aplikace se načte
- [ ] Service Worker je registrován (F12 → Application)
- [ ] PWA lze nainstalovat (ikona v address baru)
- [ ] Offline mode funguje (DevTools → Network → Offline)
- [ ] Přidat vozidlo funguje
- [ ] Přidat tankování funguje
- [ ] CSV export funguje
- [ ] Dark mode funguje

---

## 📊 Co se stane po nasazení?

### Automatické deploymenty (GitHub metoda)
```
Každý git push → Automatický deploy na Cloudflare
```

### URL struktura
```
Production:  https://my-fuel-tracker.pages.dev
Preview:     https://COMMIT-SHA.my-fuel-tracker.pages.dev
```

### Funkce
- ✅ Global CDN
- ✅ Auto HTTPS
- ✅ Unlimited bandwidth
- ✅ Preview deployments
- ✅ Rollback možnost

---

## 🎯 Doporučený workflow

**První nasazení:**
```bash
1. Push na GitHub
2. Connect to Cloudflare Pages
3. Configure build settings
4. Deploy
```

**Budoucí updaty:**
```bash
# Změňte kód
git add .
git commit -m "Update: popis změny"
git push

# Cloudflare automaticky nasadí! 🚀
```

---

## 💡 Pro Tips

### Preview před production
```bash
# Vytvořte novou branch
git checkout -b feature-test

# Push na GitHub
git push origin feature-test

# Cloudflare vytvoří preview URL:
# https://feature-test.my-fuel-tracker.pages.dev
```

### Rollback na předchozí verzi
```
Cloudflare Dashboard → Your Project → Deployments
→ Vyberte starší deployment → Rollback to this deployment
```

### Custom Domain
```
Cloudflare Dashboard → Your Project → Custom domains
→ Set up a custom domain → Zadejte doménu
→ DNS se nastaví automaticky
```

---

## 📞 Potřebujete pomoc?

**GitHub Issues:**
- Git problém: https://docs.github.com/en/get-started
- Cloudflare Pages: https://developers.cloudflare.com/pages/

**Stack Overflow:**
- Tag: cloudflare-pages
- Tag: git

**Cloudflare Community:**
- https://community.cloudflare.com/

---

**Hodně štěstí! 🚀**

Pokud máte jakýkoliv problém, napište mi přesnou chybovou hlášku a pomůžu!
