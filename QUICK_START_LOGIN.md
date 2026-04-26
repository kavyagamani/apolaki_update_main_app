# 🚀 APOLAKI SOLAR - 3 MINUTE LOCAL LOGIN SETUP

> **Copy-paste these 3 commands. Login will work in under 3 minutes.**

## Terminal 1: Start Database

```bash
docker-compose -f config/docker-compose.yml up -d postgres
sleep 10
```

**Wait until it shows:** `✅ (healthy)`

## Terminal 2: Start Backend

```bash
cd middleware/netlify-db-service
npm install
npm run dev
```

**Wait until you see:**
```
✅ Seeded default admin user: admin@apolaki.solar / admin123
Express server running on port 3001
```

## Terminal 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

**Wait until you see:**
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Browser: Login

1. Open: **http://localhost:5173**
2. Click: **"Login to Apolaki Solar"**
3. Enter:
   - Email: `admin@apolaki.solar`
   - Password: `admin123`
4. Click: **Login**

**✅ You should be logged in!**

---

## Verify It's Working

In any terminal, run:
```bash
./quick-test.sh
```

Should show all green checkmarks.

---

## If Something Fails

```bash
./debug-local-login.sh
```

This will tell you exactly what's wrong and how to fix it.

---

**That's it! You're done. 🎉**
