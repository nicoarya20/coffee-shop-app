# Interactive Coffee Shop App - Project Context

## Project Overview

This is a **React-based Single Page Application (SPA)** for an interactive coffee shop ordering system. The project is generated from a **Figma Make** design and implements a complete e-commerce flow for browsing products, managing a cart, and placing orders.

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.3.1 |
| **Bundler** | Vite 6.3.5 |
| **Routing** | React Router 7.13.0 |
| **Styling** | Tailwind CSS 4.1.12 |
| **UI Components** | Radix UI, shadcn/ui, Material UI |
| **State Management** | React Context API |
| **Notifications** | Sonner (toast notifications) |
| **Animation** | Motion (Framer Motion) |
| **Package Manager** | Bun (bun.lock present) |

### Architecture

```
src/
├── main.tsx              # Entry point
├── app/
│   ├── App.tsx           # Root component with providers
│   ├── routes.tsx        # React Router configuration
│   ├── components/       # Reusable components
│   │   ├── BottomNav.tsx
│   │   ├── ProductCard.tsx
│   │   ├── figma/        # Figma-generated components
│   │   └── ui/           # shadcn/ui components
│   ├── context/          # React Context providers
│   │   ├── CartContext.tsx
│   │   └── OrderContext.tsx
│   ├── data/             # Static data
│   │   └── products.ts
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Menu.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Orders.tsx
│   │   └── Profile.tsx
│   └── types/            # TypeScript types
│       └── index.ts
└── styles/
    └── index.css
```

### Key Features

- **Product Catalog**: Browse coffee, tea, and snacks with images and descriptions
- **Size Options**: Products support multiple sizes with different prices
- **Shopping Cart**: Add, update, and remove items with persistent state
- **Checkout Flow**: Customer name and notes for orders
- **Order History**: Track order status (pending → preparing → ready → completed)
- **User Profile**: Display user info and loyalty points
- **Bottom Navigation**: Mobile-style navigation across main sections

## Building and Running

### Installation

```bash
npm install
# or with bun
bun install
```

### Development Server

```bash
npm run dev
# or
bun run dev
```

The app runs on Vite's dev server (typically `http://localhost:5173`).

### Production Build

```bash
npm run build
# or
bun run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |

## Development Conventions

### Code Style

- **TypeScript**: All files use `.tsx` or `.ts` extensions with strict typing
- **Path Aliases**: Use `@/` alias for `src/` directory imports
- **Component Structure**: Functional components with TypeScript interfaces
- **Naming**: PascalCase for components, camelCase for functions/variables

### State Management

- Use **React Context** for global state (Cart, Orders)
- Custom hooks for context access: `useCart()`, `useOrders()`
- Context providers wrap the app in `App.tsx`

### Styling

- **Tailwind CSS** for all styling (v4 with Vite plugin)
- Utility-first approach with responsive design
- shadcn/ui components for common UI patterns

### Data Flow

```
products.ts (static data)
    ↓
pages (display products)
    ↓
CartContext (manage cart state)
    ↓
OrderContext (manage orders)
    ↓
toast notifications (user feedback)
```

### Type Definitions

Key types in `src/app/types/index.ts`:

- `Product`: Product catalog items with optional sizes
- `CartItem`: Cart entries with product, quantity, size, total
- `Order`: Order records with status tracking
- `User`: User profile information

## Important Notes

1. **Figma Make Project**: This project originates from Figma Make. The `src/app/components/figma/` directory contains auto-generated components.

2. **Vite Config Requirements**: The React and Tailwind plugins are both required for Make, even if Tailwind is not actively used.

3. **Asset Handling**: Raw imports supported for `.svg` and `.csv` files. Do not add `.css`, `.tsx`, or `.ts` to `assetsInclude`.

4. **External Assets**: 
   - UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT license)
   - Photos from [Unsplash](https://unsplash.com/)

5. **Currency**: Prices are in Indonesian Rupiah (IDR) format (e.g., 25000 = Rp 25.000).

## File Restrictions

When editing `vite.config.ts`:
- Never remove the React or Tailwind plugins
- Never add `.css`, `.tsx`, or `.ts` to `assetsInclude`
