# 📋 Coffee Shop App - Development Tasks

Dokumen ini berisi daftar tugas lengkap untuk membuat aplikasi Coffee Shop berjalan dengan maksimal sesuai dengan desain dan fungsionalitas yang diharapkan.

---

## 🎯 Priority Legend

| Priority | Description |
|----------|-------------|
| 🔴 **CRITICAL** | Fitur penting yang harus ada untuk aplikasi berjalan dengan baik |
| 🟡 **HIGH** | Fitur penting untuk user experience |
| 🟢 **MEDIUM** | Fitur pendukung untuk meningkatkan UX |
| 🔵 **LOW** | Nice-to-have / polish |

---

## 1. 🔴 CRITICAL - Backend & Database

### 1.1 Environment Setup
- [ ] **Buat file `.env`** berdasarkan `.env.example`
  - DATABASE_URL (Supabase PostgreSQL)
  - DIRECT_URL (Supabase PostgreSQL)
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - PORT=3001
  - NODE_ENV=development

### 1.2 Database Migration
- [ ] **Jalankan Prisma migrations**
  ```bash
  npm run db:generate
  npm run db:push   # untuk development
  # atau
  npm run db:migrate   # untuk production
  ```

### 1.3 Seed Data
- [ ] **Jalankan seed untuk users** (admin & user)
  ```bash
  npx prisma db seed
  ```
- [ ] **Buat seed data untuk products** (opsional, untuk demo)
  - Buat file `prisma/seed-products.ts`
  - Tambahkan 10-15 produk coffee, tea, snacks
  - Include sizes untuk setiap produk

### 1.4 API Server
- [ ] **Pastikan server berjalan** di port 3001
  ```bash
  npm run server
  ```
- [ ] **Test health endpoint**: `GET http://localhost:3001/api/health`
- [ ] **Test semua API endpoints** dengan Postman/Thunder Client

---

## 2. 🔴 CRITICAL - Authentication & Authorization

### 2.1 Login/Register Flow
- [ ] **Fix ProductDetail page** - masih menggunakan static data
  - Replace import dari `../data/products` dengan API call
  - Gunakan `api.products.getById(id)` untuk fetch product
  
- [ ] **Improve error handling** di Login page
  - [ ] Show specific error messages dari backend
  - [ ] Add loading state yang lebih jelas
  - [ ] Add "Forgot Password" functionality (reset via email)

- [ ] **Improve Register page**
  - [ ] Add password strength indicator
  - [ ] Add terms & conditions checkbox
  - [ ] Add email verification flow (optional)

### 2.2 Protected Routes
- [ ] **Fix ProtectedRoute** di `routes.tsx`
  - Saat ini sudah ada, tapi pastikan redirect bekerja dengan baik
  - [ ] Add redirect back to original page setelah login
  
- [ ] **Session Management**
  - [ ] Add token expiration handling
  - [ ] Add auto-logout setelah session expired
  - [ ] Consider menggunakan JWT tokens (saat ini hanya localStorage)

---

## 3. 🟡 HIGH - Product Management

### 3.1 Product Detail Page
- [ ] **Fix ProductDetail.tsx** - CRITICAL!
  ```tsx
  // GANTI ini:
  import { products } from '../data/products';
  const product = products.find((p) => p.id === id);
  
  // DENGAN ini:
  const [product, setProduct] = useState<Product | null>(null);
  useEffect(() => {
    const fetchProduct = async () => {
      const response = await api.products.getById(id!);
      setProduct(response.data);
    };
    fetchProduct();
  }, [id]);
  ```

- [ ] **Add image zoom** atau gallery view untuk product images
- [ ] **Add related products** section di bawah
- [ ] **Add reviews/ratings** (optional)

### 3.2 Product Images
- [ ] **Setup Cloudinary** untuk image upload
  - [ ] Daftar di https://cloudinary.com
  - [ ] Get API credentials
  - [ ] Update `.env` dengan Cloudinary credentials
  - [ ] Test upload dari Admin Products page

- [ ] **Image optimization**
  - [ ] Add lazy loading untuk semua product images
  - [ ] Add responsive images (srcset)
  - [ ] Add image placeholder saat loading

### 3.3 Product Features
- [ ] **Fix ProductCard** untuk handle products tanpa sizes
- [ ] **Add "Out of Stock"** indicator
- [ ] **Add product variants** selain size (e.g., sugar level, ice level)

---

## 4. 🟡 HIGH - Cart & Checkout

### 4.1 Cart Persistence
- [ ] **Persist cart to localStorage**
  - Saat ini cart hilang saat refresh
  - [ ] Save cart state ke localStorage
  - [ ] Load cart dari localStorage saat app start

- [ ] **Sync cart dengan backend** (optional, untuk multi-device)
  - [ ] Save cart ke database saat user login
  - [ ] Merge cart saat login

### 4.2 Checkout Flow
- [ ] **Fix Checkout page**
  - [ ] Payment method saat ini hanya UI (tidak diproses)
  - [ ] Add payment gateway integration (Midtrans/Xendit) untuk production
  - [ ] Atau set "Cash on Pickup" sebagai default

- [ ] **Order Confirmation**
  - [ ] Add order success page dengan order details
  - [ ] Add option to share order (WhatsApp, etc.)
  - [ ] Add estimated pickup time

- [ ] **Loyalty Points Calculation**
  - [ ] Show points yang akan didapat di checkout page
  - [ ] Add option to redeem points di checkout

---

## 5. 🟡 HIGH - Order Management

### 5.1 User Orders
- [ ] **Fix Orders page** untuk user
  - Saat ini menampilkan SEMUA orders dari database
  - [ ] Filter orders berdasarkan userId yang login
  - [ ] Update API: `GET /api/orders?userId=xxx`
  
- [ ] **Order Tracking**
  - [ ] Add real-time order status updates (WebSocket/polling)
  - [ ] Add push notifications untuk status changes
  - [ ] Add order timeline visual (pending → preparing → ready → completed)

### 5.2 Admin Orders
- [ ] **Add bulk actions** untuk orders
  - [ ] Mark multiple orders as completed
  - [ ] Print orders batch
  
- [ ] **Order filtering**
  - [ ] Filter by date range
  - [ ] Filter by customer name
  - [ ] Search by order ID

- [ ] **Order statistics**
  - [ ] Daily/weekly/monthly revenue charts
  - [ ] Best selling products
  - [ ] Peak hours analysis

---

## 6. 🟡 HIGH - User Profile & Loyalty

### 6.1 Profile Features
- [ ] **Edit Profile**
  - [ ] Add edit profile form (name, phone, email)
  - [ ] Add change password functionality
  - [ ] Add profile picture upload (optional)

- [ ] **Loyalty Points System**
  - [ ] Fix points calculation (saat ini sudah ada di handlers.ts)
  - [ ] Ensure points awarded saat order completed
  - [ ] Add points expiration (optional)

### 6.2 Points Redemption
- [ ] **Redeem Points**
  - [ ] Add rewards catalog (free coffee, discounts, etc.)
  - [ ] Add redeem points functionality
  - [ ] Add points history dengan filter (earned vs redeemed)

- [ ] **Loyalty Tiers** (optional)
  - [ ] Bronze, Silver, Gold tiers
  - [ ] Special benefits per tier
  - [ ] Progress bar ke tier berikutnya

---

## 7. 🟢 MEDIUM - Admin Dashboard

### 7.1 Dashboard Improvements
- [ ] **AdminDashboard.tsx** - Buat halaman yang proper
  - Saat ini belum ada implementasi detail
  - [ ] Add revenue charts (daily, weekly, monthly)
  - [ ] Add recent orders widget
  - [ ] Add low stock alerts
  - [ ] Add quick stats cards

### 7.2 Product Management
- [ ] **AdminProductsPage** - Sudah bagus, tapi bisa ditambah:
  - [ ] Bulk upload products (CSV import)
  - [ ] Duplicate product feature
  - [ ] Product categories management
  - [ ] Add product analytics (views, sales)

### 7.3 Order Management
- [ ] **AdminOrdersPage** - Sudah bagus, tambahan:
  - [ ] Add order details modal
  - [ ] Print order receipt
  - [ ] Export orders to CSV
  - [ ] Add customer notes highlight

---

## 8. 🟢 MEDIUM - UI/UX Improvements

### 8.1 Navigation
- [ ] **BottomNav**
  - [ ] Add badge untuk notifications
  - [ ] Add haptic feedback saat tap (mobile)
  - [ ] Add active state animation

- [ ] **AdminBottomNav**
  - [ ] Ensure konsisten dengan BottomNav styling

### 8.2 Animations & Transitions
- [ ] **Add page transitions**
  - [ ] Slide animations saat navigate
  - [ ] Fade in/out untuk modals
  - [ ] Skeleton loaders untuk semua loading states

- [ ] **Micro-interactions**
  - [ ] Button press animations
  - [ ] Card hover effects
  - [ ] Add to cart animation

### 8.3 Dark Mode
- [ ] **ThemeContext** sudah ada, tapi:
  - [ ] Implement dark mode toggle di Settings/Profile
  - [ ] Add dark mode styles untuk semua components
  - [ ] Persist theme preference ke localStorage

---

## 9. 🟢 MEDIUM - Settings Page

### 9.1 Settings Implementation
- [ ] **Buat Settings.tsx** yang proper
  - [ ] Notification settings
    - [ ] Push notifications toggle
    - [ ] Email notifications toggle
    - [ ] SMS notifications toggle
  - [ ] App preferences
    - [ ] Language selector (EN/ID)
    - [ ] Currency display format
    - [ ] Theme (dark/light/system)
  - [ ] Privacy settings
    - [ ] Clear order history
    - [ ] Clear cart
    - [ ] Delete account

---

## 10. 🔵 LOW - Additional Features

### 10.1 Search & Discovery
- [ ] **Advanced Search**
  - [ ] Search dari Home page (saat ini hanya link ke Menu)
  - [ ] Search dengan filters (price range, category, size)
  - [ ] Search history
  - [ ] Popular searches

- [ ] **Recommendations**
  - [ ] "You might also like" section
  - [ ] "Frequently bought together"
  - [ ] Personalized recommendations based on order history

### 10.2 Promotions
- [ ] **Promo Codes**
  - [ ] Add promo code input di checkout
  - [ ] Validate promo codes dari backend
  - [ ] Apply discount to order total

- [ ] **Special Offers**
  - [ ] Fix "Special Offer" banner di Home (saat ini hanya UI)
  - [ ] Add promo management di Admin
  - [ ] Schedule promotions (start/end date)

### 10.3 Social Features
- [ ] **Share & Refer**
  - [ ] Share products to social media
  - [ ] Refer a friend program
  - [ ] Share order with friends

- [ ] **Reviews & Ratings** (optional)
  - [ ] Add product ratings
  - [ ] Add product reviews
  - [ ] Moderate reviews dari Admin

---

## 11. 🔵 LOW - Performance & Optimization

### 11.1 Performance
- [ ] **Code Splitting**
  - [ ] Lazy load admin pages
  - [ ] Lazy load heavy components
  - [ ] Route-based code splitting

- [ ] **Image Optimization**
  - [ ] Use WebP format
  - [ ] Implement responsive images
  - [ ] Add image CDN (Cloudinary sudah support)

- [ ] **Bundle Size**
  - [ ] Analyze bundle dengan `npm run build`
  - [ ] Remove unused dependencies
  - [ ] Tree shaking optimization

### 11.2 Caching
- [ ] **React Query / SWR** (optional)
  - Consider using for better data fetching
  - Automatic caching & refetching
  - Optimistic updates

- [ ] **API Caching**
  - [ ] Cache products list
  - [ ] Cache user profile
  - [ ] Invalidate cache on updates

---

## 12. 🔵 LOW - Testing & Quality

### 12.1 Testing
- [ ] **Unit Tests**
  - [ ] Test utility functions
  - [ ] Test context providers
  - [ ] Test API client

- [ ] **Component Tests**
  - [ ] Test critical components (ProductCard, Cart, etc.)
  - [ ] Test forms (Login, Register, Checkout)

- [ ] **E2E Tests** (optional)
  - [ ] Test complete user flow
  - [ ] Test admin flow
  - [ ] Test payment flow

### 12.2 Error Handling
- [ ] **Error Boundaries**
  - [ ] Add React Error Boundaries
  - [ ] Custom error pages (404, 500)
  - [ ] Graceful error recovery

- [ ] **Offline Support**
  - [ ] Add offline detection
  - [ ] Show offline message
  - [ ] Queue actions for when back online

---

## 13. 🔵 LOW - Deployment & DevOps

### 13.1 Production Build
- [ ] **Build Optimization**
  - [ ] Test production build: `npm run build`
  - [ ] Test server build
  - [ ] Environment-specific configs

### 13.2 Deployment
- [ ] **Vercel Deployment** (sudah ada vercel.json)
  - [ ] Setup Vercel project
  - [ ] Configure environment variables
  - [ ] Test deployment

- [ ] **Database Migration**
  - [ ] Run migrations on production database
  - [ ] Seed initial data
  - [ ] Backup strategy

### 13.3 Monitoring
- [ ] **Error Tracking**
  - [ ] Integrate Sentry (optional)
  - [ ] Log errors to backend
  - [ ] User feedback on errors

- [ ] **Analytics**
  - [ ] Google Analytics / Plausible
  - [ ] Track user flows
  - [ ] Conversion tracking

---

## 14. 📝 Documentation

### 14.1 User Documentation
- [ ] **FAQ Page**
  - [ ] Common questions
  - [ ] How to order guide
  - [ ] Loyalty points explanation

- [ ] **Help & Support**
  - [ ] Contact form
  - [ ] Live chat integration (optional)
  - [ ] WhatsApp link

### 14.2 Developer Documentation
- [ ] **API Documentation**
  - [ ] Document all endpoints
  - [ ] Request/response examples
  - [ ] Authentication guide

- [ ] **Setup Guide**
  - [ ] Local development setup
  - [ ] Environment variables guide
  - [ ] Database setup guide

---

## 🚀 Quick Start Checklist

Untuk menjalankan aplikasi dengan cepat:

### 1. Setup Environment
```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan credentials kamu
# - DATABASE_URL (Supabase)
# - CLOUDINARY credentials (optional untuk image upload)
```

### 2. Setup Database
```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed users (admin & user)
npx prisma db seed
```

### 3. Run Development
```bash
# Run both frontend & backend
npm run dev:all

# Atau run separately:
npm run dev      # frontend only
npm run server   # backend only
```

### 4. Test Login
- **User**: `user@coffee.com` / `userpassword`
- **Admin**: `admin@coffee.com` / `adminpassword`

### 5. Access Pages
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`
- API Health: `http://localhost:3001/api/health`

---

## 📊 Priority Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 15 | Must do first |
| 🟡 HIGH | 25 | Important for UX |
| 🟢 MEDIUM | 20 | Enhancements |
| 🔵 LOW | 30 | Nice to have |

---

## 🎯 Next Steps (Recommended Order)

1. **Setup environment & database** (Section 1)
2. **Fix ProductDetail page** (Section 3.1) - CRITICAL!
3. **Persist cart to localStorage** (Section 4.1)
4. **Fix Orders page filtering** (Section 5.1)
5. **Setup Cloudinary** (Section 3.2)
6. **Improve checkout flow** (Section 4.2)
7. **Build Settings page** (Section 9)
8. **Add dark mode** (Section 8.3)
9. **Performance optimizations** (Section 11)
10. **Testing & deployment** (Section 12-13)

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi yang sudah ada (README.md, ADMIN.md, dll)
2. Check console logs untuk error messages
3. Verify API endpoints dengan Postman
4. Ensure database connection is working

---

**Last Updated**: February 27, 2026
**Version**: 1.0.0
