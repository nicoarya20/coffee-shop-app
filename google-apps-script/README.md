# Google Apps Script Setup Guide

Panduan setup untuk upload gambar ke Google Drive pribadi menggunakan Google Apps Script.

## 🚀 Quick Setup (10 menit)

### Step 1: Buka Google Apps Script

1. Buka https://script.google.com/
2. Login dengan akun Google kamu yang punya Drive pribadi
3. Click **"+ New Project"** (atau "New Project")

### Step 2: Paste Kode

1. Delete semua kode default di `Code.gs`
2. Copy kode dari file `Code.gs` di folder ini
3. Paste ke Google Apps Script editor
4. Click **"Save"** icon (💾) atau Ctrl+S
5. Beri nama project: "Coffee Shop Upload API"

### Step 3: Deploy sebagai Web App

1. Click **"Deploy"** button (top right)
2. Select **"New deployment"**
3. Click gear icon ⚙️ next to "Select type"
4. Choose **"Web app"**
5. Isi form:
   - **Description**: "Coffee Shop Upload API v1"
   - **Execute as**: `Me` (email kamu)
   - **Who has access**: `Anyone` (atau `Anyone with Google account`)
6. Click **"Deploy"**

### Step 4: Authorize Access

1. Click **"Authorize access"**
2. Pilih akun Google kamu
3. Akan muncul warning "Google hasn't verified this app"
4. Click **"Advanced"**
5. Click **"Go to ... (unsafe)"**
6. Click **"Allow"**

### Step 5: Copy Web App URL

1. Setelah deploy berhasil, akan muncul **"Web app URL"**
2. Copy URL tersebut (format: `https://script.google.com/macros/s/...../exec`)
3. Paste ke file `.env`:

```env
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

### Step 6: Update .env

Buka file `.env` dan tambahkan:

```env
# Google Apps Script for Drive Upload
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

> ⚠️ **Hapus** atau biarkan kosong variabel berikut (tidak dipakai lagi):
> - `GOOGLE_CLIENT_EMAIL`
> - `GOOGLE_PRIVATE_KEY`
> - `GOOGLE_DRIVE_FOLDER_ID`

### Step 7: Test Upload

1. Restart server:
   ```bash
   # Stop server (Ctrl+C)
   npm run server
   ```

2. Buka Admin Dashboard: `/admin`
3. Click **"Add Product"**
4. Upload gambar
5. Jika berhasil, gambar akan tersimpan di Google Drive kamu!

---

## 📁 Folder di Google Drive

Script akan otomatis membuat folder bernama **"Coffee Shop Products"** di Google Drive kamu.

Untuk akses folder:
1. Buka https://drive.google.com/
2. Cari folder "Coffee Shop Products"
3. Semua gambar upload akan muncul di sini

---

## 🔧 Troubleshooting

### Error: "Execution failed"

1. Buka https://script.google.com/
2. Click project "Coffee Shop Upload API"
3. Click **"Executions"** di left sidebar
4. Lihat error detail di log

### Error: "You do not have permission"

1. Undeploy dan redeploy web app:
   - Click **"Deploy"** > **"Manage deployments"**
   - Click edit (✏️) pada deployment
   - Change **"Who has access"** to `Anyone`
   - Click **"Deploy"**

### Error: "Network error" / Timeout

Google Apps Script punya timeout 6 menit untuk file besar.
- Pastikan file < 5MB
- Kompres gambar jika perlu

### File tidak muncul di Drive

1. Cek folder "Coffee Shop Products" di Drive
2. Cek Executions log di Apps Script
3. Pastikan URL di `.env` benar (akhiran `/exec`, bukan `/dev`)

---

## 🔐 Security Notes

- **Who has access: Anyone** = Siapa saja dengan URL bisa upload
- URL web app cukup aman karena random dan tidak mudah ditebak
- Untuk extra security, bisa tambahkan token di URL:
  ```env
  GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/...../exec?token=YOUR_SECRET_TOKEN"
  ```

---

## 📊 Quota Limits

Google Apps Script free tier:
- **6 menit** execution time per request
- **100 requests** per day (untuk consumer account)
- **50 MB** total storage ( Drive quota kamu)

Untuk coffee shop app dengan ~50 produk, ini cukup!

---

## 🔄 Redeploy (Jika Ada Update Kode)

1. Edit kode di Apps Script
2. Click **"Deploy"** > **"Manage deployments"**
3. Click edit (✏️)
4. Change **Version** to "New version"
5. Click **"Deploy"**

---

## 📚 Resources

- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [DriveApp Reference](https://developers.google.com/apps-script/reference/drive/drive-app)
- [Deploy Web Apps](https://developers.google.com/apps-script/guides/web)
