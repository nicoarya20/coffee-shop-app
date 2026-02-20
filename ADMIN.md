# Admin Panel Documentation

## URLs

| Page | URL | Description |
|------|-----|-------------|
| **Admin Dashboard** | `http://localhost:5173/admin` | Main admin overview with stats |
| **Orders Management** | `http://localhost:5173/admin/orders` | Manage all customer orders |
| **Products Management** | `http://localhost:5173/admin/products` | CRUD operations for products |

## Access Admin Panel

1. Go to Profile page (`http://localhost:5173/profile`)
2. Click on "Admin Dashboard" menu item (marked with purple "Admin" badge)
3. Or directly navigate to `http://localhost:5173/admin`

## Features

### Admin Dashboard (`/admin`)

**Overview Tab:**
- Total orders, revenue, active orders, and products count
- Recent orders preview
- Quick navigation to other sections

**Orders Tab:**
- Filter orders by: Pending, Active, All
- Update order status with one click
- View order details including items and notes
- Real-time notifications for new orders (every 5 seconds)

**Products Tab:**
- Quick product search
- Add new products
- Edit existing products
- Delete products
- Toggle featured status

### Orders Management (`/admin/orders`)

**Features:**
- View all orders with detailed information
- Filter by status: All, Pending, Active, Completed
- Quick stats showing order counts
- Update order status through the workflow:
  - `Pending` → `Start Preparing` → `Mark as Ready` → `Complete Order`
  - `Pending` → `Cancel Order`
- View customer notes and order items
- Auto-refresh every 5 seconds

**Order Status Flow:**
```
Pending → Preparing → Ready → Completed
   ↓
Cancel
```

### Products Management (`/admin/products`)

**Features:**
- **Create** new products with full details
- **Read** all products with search and filter
- **Update** product information
- **Delete** products (with confirmation)
- Toggle featured status
- Manage product sizes
- Filter by category: All, Coffee, Tea, Snacks

**Product Form Fields:**
- Product Name (required)
- Description (required)
- Category (Coffee/Tea/Snacks)
- Base Price in IDR (required)
- Image URL (required)
- Featured toggle
- Sizes (optional, multiple)

## API Endpoints

### Products
```
GET    /api/products           - Get all products
GET    /api/products/:id       - Get product by ID
GET    /api/products/featured  - Get featured products
GET    /api/products/search?q= - Search products
POST   /api/products           - Create product
PUT    /api/products/:id       - Update product
DELETE /api/products/:id       - Delete product
```

### Orders
```
GET    /api/orders             - Get all orders
GET    /api/orders/:id         - Get order by ID
POST   /api/orders             - Create order
PATCH  /api/orders/:id/status  - Update order status
```

## Real-time Notifications

The admin panel automatically polls for new orders every 5 seconds:
- Visual notification via toast message
- Audio notification (ding sound)
- Badge counter on bell icon

## Mobile-Friendly Design

All admin pages are designed with mobile-first approach:
- Bottom navigation bar
- Touch-friendly buttons
- Responsive grid layouts
- Swipe-friendly interfaces

## Development

### Run the Server
```bash
# Run API server only
bun run server

# Run both frontend and backend
bun run dev:all
```

### Environment Variables
Make sure `.env` file is configured with Supabase credentials:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PORT=3001
```

## Tips

1. **Quick Order Management**: Use the Overview tab for quick access to pending orders
2. **Product Images**: Use Unsplash or similar services for product images
3. **Featured Products**: Mark bestsellers as featured to show on home page
4. **Order Notes**: Always check customer notes before preparing orders
5. **Status Updates**: Update order status promptly to keep customers informed

## Troubleshooting

**Orders not appearing?**
- Check if API server is running on port 3001
- Verify database connection in `.env`
- Check browser console for errors

**Can't create/update products?**
- Ensure all required fields are filled
- Check image URL is valid
- Verify API server is connected to database

**Notifications not working?**
- Allow audio autoplay in browser settings
- Check if toast notifications are enabled
- Verify polling interval in code
