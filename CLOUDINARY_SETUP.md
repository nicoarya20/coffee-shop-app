# Cloudinary Setup Guide

Panduan lengkap untuk setup Cloudinary sebagai storage gambar produk.

## 🚀 Quick Setup (5 menit)

### Step 1: Daftar Cloudinary

1. Buka https://cloudinary.com/users/register/free
2. Isi form registrasi:
   - **Email**: Gunakan email aktif
   - **Password**: Buat password kuat
   - **Name**: Nama kamu
3. Click **"Sign Up"**
4. Verifikasi email (cek inbox)

### Step 2: Get API Credentials

1. Login ke https://cloudinary.com/console
2. Di dashboard, lihat credentials di bagian atas:
   - **Cloud Name** (e.g., `dxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnop`) - click "Reveal" untuk lihat

3. Copy semua credentials

### Step 3: Update .env

Buka file `.env` dan paste credentials:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Step 4: Install & Restart

```bash
# Install dependencies (sudah terinstall)
npm install

# Restart server
npm run server
```

### Step 5: Test Upload

1. Buka `/admin` → "Add Product"
2. Upload gambar (WEBP, PNG, JPG, dll)
3. Click "Create Product"
4. Gambar akan otomatis upload ke Cloudinary!

---

## ☁️ Cloudinary Features

### Auto Optimization

Cloudinary otomatis:
- ✅ Compress gambar tanpa kualitas turun
- ✅ Convert ke WebP untuk browser support
- ✅ CDN global untuk fast loading
- ✅ Responsive images

### Free Tier Limits

- ✅ **25 GB** storage
- ✅ **25 GB** bandwidth/month
- ✅ Unlimited transformations
- ✅ ~500-1000 images (tergantung ukuran)

Cukup untuk coffee shop app!

---

## 📁 Folder Structure

Gambar akan tersimpan di folder `coffee-shop-products/` di Cloudinary.

Untuk lihat semua gambar:
1. Login ke Cloudinary Console
2. Click **"Media"** di sidebar
3. Browse folder `coffee-shop-products`

---

## 🔧 Advanced Configuration

### Change Upload Folder

Edit `server/services/cloudinary.ts`:

```typescript
const result = await cloudinary.uploader.upload(dataUri, {
  folder: 'your-custom-folder', // Change here
  ...
});
```

### Custom Transformations

Edit `server/services/cloudinary.ts`:

```typescript
transformation: [
  { width: 800, height: 600, crop: 'fill' }, // Resize
  { quality: 'auto:best' }, // Best quality
  { fetch_format: 'auto' }, // Auto format
],
```

### Delete Old Images

Cloudinary public ID disimpan di database. Untuk delete:

```typescript
import { deleteFile } from './services/cloudinary';

await deleteFile('coffee-shop-products/1234567890_image');
```

---

## 🎨 Image URL Format

Cloudinary URL format:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/folder/filename.jpg
```

Features:
- ✅ HTTPS secure
- ✅ Global CDN
- ✅ No hotlink protection
- ✅ No rate limiting

---

## 📊 Monitoring Usage

Check usage:
1. Login ke Cloudinary Console
2. Click **"Settings"** → **"Plan"**
3. Lihat storage & bandwidth usage

Alerts (optional):
1. Click **"Settings"** → **"Notifications"**
2. Setup email alerts untuk quota

---

## 🛠️ Troubleshooting

### Error: "Invalid API Key"

- Check credentials di `.env`
- Restart server setelah edit `.env`
- Pastikan tidak ada typo

### Error: "Upload preset not found"

Kita pakai signed upload (API Key), jadi tidak perlu upload preset.

### Gambar tidak muncul

1. Check console log untuk error
2. Test URL gambar di browser baru
3. Check Cloudinary Media Library

### Quota penuh

- Delete unused images di Cloudinary Console
- Upgrade ke paid plan ($8.90/month untuk 100GB)

---

## 💰 Pricing

**Free Tier** (cukup untuk development):
- 25 GB storage
- 25 GB bandwidth/month
- Unlimited transformations

**Paid Plans** (production):
- Plus: $8.90/month (100 GB)
- Premium: $24.90/month (500 GB)
- Custom: Enterprise

---

## 🔐 Security

- ✅ API Secret tidak pernah dikirim ke client
- ✅ Signed upload dari server
- ✅ HTTPS untuk semua request
- ✅ No public upload (perlu authentication)

---

## 📚 Resources

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Upload API](https://cloudinary.com/documentation/upload_images)
- [Transformations](https://cloudinary.com/documentation/image_transformations)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)

---

## 🎯 Next Steps

1. ✅ Setup Cloudinary (5 min)
2. ✅ Test upload produk
3. ✅ Delete Google Apps Script (tidak diperlukan lagi)
4. ✅ Enjoy! No more 429 errors! 🎉
