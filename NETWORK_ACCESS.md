# 📱 Network Access Guide - Coffee Shop App

## Cara Akses dari HP/Network

### 1️⃣ Pastikan Laptop dan HP dalam 1 WiFi

Kedua device harus terhubung ke **jaringan WiFi yang sama**.

### 2️⃣ Cek IP Address Laptop

**macOS:**
```bash
ipconfig getifaddr en0
# atau
ipconfig getifaddr en1
```

**Windows:**
```cmd
ipconfig
```

**Linux:**
```bash
hostname -I
```

Catat IP address yang muncul (contoh: `192.168.1.175`)

### 3️⃣ Jalankan Development Server

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

Server akan berjalan di:
- **Frontend**: `http://0.0.0.0:5137` (accessible dari network)
- **Backend**: `http://localhost:3001`

### 4️⃣ Akses dari HP

Buka browser di HP dan akses:

```
http://192.168.1.175:5137
```

Ganti `192.168.1.175` dengan IP laptop kamu.

---

## 🔧 Konfigurasi API

### Opsi 1: Otomatis (Recommended)

API client sudah dikonfigurasi untuk **otomatis detect** network access.

Saat akses dari HP (`http://192.168.1.175:5137`), API akan otomatis connect ke:
```
http://192.168.1.175:3001/api
```

### Opsi 2: Manual dengan .env

Jika ada masalah, buat file `.env` di root:

```bash
# .env
VITE_API_URL=http://192.168.1.175:3001/api
```

Kemudian **restart dev server**.

---

## 🚨 Troubleshooting

### ❌ "Cannot connect to API" / "Network Error"

**Solusi:**

1. **Check firewall laptop:**
   - macOS: System Preferences → Security → Firewall
   - Windows: Windows Defender Firewall
   - Allow incoming connections untuk port `3001` dan `5137`

2. **Pastikan backend berjalan:**
   ```bash
   # Test di laptop
   curl http://localhost:3001/api/health
   
   # Harus return: {"status":"ok",...}
   ```

3. **Test API dari HP:**
   Buka di browser HP:
   ```
   http://192.168.1.175:3001/api/health
   ```
   
   Jika tidak connect, backend tidak jalan atau firewall memblokir.

4. **Check IP address berubah:**
   IP bisa berubah jika restart router. Cek ulang dengan:
   ```bash
   ipconfig getifaddr en0
   ```

### ❌ "This site can't be reached" / Loading forever

**Solusi:**

1. **Restart dev server:**
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

2. **Check port tidak digunakan:**
   ```bash
   # macOS/Linux
   lsof -i :5137
   
   # Windows
   netstat -ano | findstr :5137
   ```

3. **Ganti port jika perlu:**
   Edit `vite.config.ts`:
   ```typescript
   server: {
     host: '0.0.0.0',
     port: 5173, // Ganti port
   }
   ```

### ❌ API bekerja tapi frontend tidak

**Check console browser di HP:**

1. Buka **Chrome DevTools** di HP:
   - Chrome Android: `chrome://inspect`
   - Safari iOS: Connect ke Mac → Safari → Develop

2. Lihat error di console

3. Check `API Base URL:` di console - harus show IP yang benar

---

## 📝 Tips

### Hot Reload dari Network

- Perubahan code akan **auto-reload** di HP
- Tapi lebih lambat dari localhost
- Untuk development cepat: test di localhost dulu, baru test di HP

### Multiple Devices Testing

Bisa akses dari **banyak device** sekaligus:
- HP Android
- iPhone
- Tablet
- Laptop lain

Semua bisa akses selama dalam 1 WiFi.

### Production Build

Untuk production, gunakan environment variables yang proper:

```bash
# .env.production
VITE_API_URL=https://your-api.com/api
```

---

## 📞 Support

Jika masih ada masalah:
1. Check log di terminal (backend & frontend)
2. Check console browser di HP
3. Pastikan kedua device di WiFi yang sama
4. Restart router jika perlu

---

**Last Updated**: February 28, 2026
