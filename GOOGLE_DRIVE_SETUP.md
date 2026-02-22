# Google Drive Setup Guide

Panduan lengkap untuk mengintegrasikan Google Drive sebagai storage untuk gambar produk.

## 📋 Prerequisites

1. Google Cloud Platform account
2. Akses untuk membuat service account

## 🔧 Step-by-Step Setup

### Step 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** dropdown di top bar
3. Click **"NEW PROJECT"**
4. Beri nama project (e.g., "Coffee Shop App")
5. Click **"CREATE"**

### Step 2: Enable Google Drive API

1. Pastikan project yang baru dibuat terpilih
2. Navigate ke **"APIs & Services"** > **"Library"** (atau buka https://console.cloud.google.com/apis/library)
3. Search untuk **"Google Drive API"**
4. Click pada **"Google Drive API"** result
5. Click **"ENABLE"** button

### Step 3: Create Service Account

1. Navigate ke **"APIs & Services"** > **"Credentials"** (atau https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** di top
3. Pilih **"Service account"**
4. Isi form:
   - **Service account name**: `coffee-shop-drive-upload`
   - **Service account ID**: (auto-generated)
   - **Description**: `Upload product images to Google Drive`
5. Click **"CREATE AND CONTINUE"**
6. Skip role assignment (optional)
7. Click **"DONE"**

### Step 4: Download JSON Key

1. Click pada service account yang baru dibuat (di daftar credentials)
2. Pindah ke tab **"KEYS"**
3. Click **"ADD KEY"** > **"Create new key"**
4. Pastikan **"JSON"** selected
5. Click **"CREATE"**
6. File JSON akan otomatis terdownload ke komputer Anda
7. ⚠️ **PENTING**: Simpan file ini dengan aman! Jangan commit ke Git.

### Step 5: Buat Folder di Google Drive

1. Buka [Google Drive](https://drive.google.com/)
2. Click **"+ New"** > **"New folder"**
3. Beri nama folder (e.g., "Coffee Shop Products")
4. Click **"Create"**
5. Buka folder tersebut
6. Copy **Folder ID** dari URL browser:
   ```
   https://drive.google.com/drive/folders/1aBC...xyz
                                        ^^^^^^^^^^^^
                                        Ini Folder ID
   ```

### Step 6: Share Folder ke Service Account

1. Di Google Drive, right-click folder yang dibuat
2. Pilih **"Share"** > **"Share"**
3. Buka file JSON yang didownload (Step 4)
4. Copy nilai dari **`client_email`** (format: `xxx@project-id.iam.gserviceaccount.com`)
5. Paste email tersebut ke kolom "Add people or groups"
6. Pilih permission **"Editor"** (untuk upload/delete files)
7. **Uncheck** "Notify people"
8. Click **"Share"**

### Step 7: Setup Environment Variables

1. Copy file `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env` dan isi dengan nilai Anda:

   ```env
   # Dari file JSON Service Account
   GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
   
   # Dari file JSON Service Account (private_key field)
   # Pastikan termasuk \n untuk newlines
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
   
   # Folder ID dari Google Drive URL
   GOOGLE_DRIVE_FOLDER_ID="1aBC123xyz_YOUR_FOLDER_ID_HERE"
   ```

### Step 8: Verifikasi Setup

1. Jalankan server:
   ```bash
   npm run server
   ```

2. Cek log server, seharusnya tidak ada warning tentang Google Drive credentials:
   ```
   🚀 Server running on http://localhost:3001
   ```

3. Jika ada warning:
   ```
   ⚠️ Google Drive credentials not configured. File upload will not work.
   ```
   Periksa kembali environment variables di `.env`.

## 🎯 Cara Menggunakan

### Upload Gambar Produk Baru

1. Buka Admin Dashboard (`/admin`)
2. Navigate ke Products
3. Click tombol **"+ Add Product"**
4. Isi form:
   - Product Name
   - Description
   - Category
   - Base Price
   - **Upload Image**: Click "Upload Image" dan pilih file dari komputer
   - Atau gunakan **Image URL** jika tidak ingin upload
5. Click **"Create Product"**

Gambar akan otomatis diupload ke Google Drive dan URL public akan disimpan di database.

### Update Produk dengan Gambar Baru

1. Edit produk yang sudah ada
2. Upload gambar baru (akan replace gambar lama)
3. Click **"Update Product"**

## 📝 Notes

- **File size limit**: 5MB per image
- **Supported formats**: JPG, PNG, GIF
- **Storage quota**: Menggunakan quota Google Drive (15GB free untuk akun Google personal)
- **Public access**: Semua file yang diupload akan diset public (reader: anyone) agar bisa ditampilkan di website

## 🔐 Security Best Practices

1. **Jangan commit `.env`** ke Git (sudah ada di `.gitignore`)
2. **Batasi permission** service account hanya ke folder tertentu
3. **Rotate keys** secara berkala dari Google Cloud Console
4. **Monitor quota** Google Drive untuk menghindari over limit

## 🛠️ Troubleshooting

### Error: "Failed to upload image"

1. Cek apakah service account sudah di-share ke folder
2. Pastikan Folder ID benar
3. Cek quota Google Drive tidak penuh

### Error: "Only image files are allowed"

File yang diupload bukan image. Pastikan file type adalah image/jpeg, image/png, dll.

### Error: "File size must be less than 5MB"

Kompres gambar atau resize sebelum upload.

### Warning: "Google Drive credentials not configured"

1. Pastikan `.env` file ada dan terisi
2. Restart server setelah edit `.env`
3. Cek format `GOOGLE_PRIVATE_KEY` (harus include `\n`)

## 📚 Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/provide-credentials-adc#service-account)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
