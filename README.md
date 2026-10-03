# ShopSphere - Production E-Commerce Platform

A complete, production-quality Amazon-style e-commerce platform built with modern technologies. ShopSphere is an educational project demonstrating full-stack web development best practices.

## 📋 Features

### General Features

- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Professional modern UI/UX
- ✅ Fast search and filtering
- ✅ Product rating and reviews
- ✅ Shopping cart and wishlist
- ✅ User authentication and profiles
- ✅ Admin dashboard with analytics
- ✅ Order management
- ✅ Payment processing (Stripe)
- ✅ Image upload and storage (Cloudinary)

### User Features

- Browse products by category
- Search products with advanced filtering
- Add/remove items from cart
- Wishlist management
- User registration and login
- Profile management
- Order history
- Product reviews and ratings
- Address management

### Admin Features

- Product management (CRUD)
- Category management
- User management
- Order management and status updates
- Review moderation
- Dashboard analytics with charts
- Revenue tracking

## 🛠 Technology Stack

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: Custom + Tailwind

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Payment**: Stripe SDK
- **File Storage**: Cloudinary API
- **Validation**: Express Validator

### Database & Infrastructure

- PostgreSQL 14+
- Prisma ORM
- Environment-based configuration

## 📁 Project Structure

```
amazon/
│
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── features/                # Complex feature modules
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── layouts/                 # Layout components
│   │   ├── services/                # API calls (axios)
│   │   ├── store/                   # Redux slices
│   │   ├── utils/                   # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Node/Express Backend
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── cartController.js
│   │   │   ├── reviewController.js
│   │   │   └── adminController.js
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   ├── validate.js          # Input validation
│   │   │   └── authorization.js     # Role-based access
│   │   ├── services/                # Business logic
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── userService.js
│   │   │   └── paymentService.js
│   │   ├── validators/              # Input validation schemas
│   │   │   ├── auth.js
│   │   │   ├── product.js
│   │   │   └── order.js
│   │   ├── utils/                   # Utility functions
│   │   │   ├── response.js
│   │   │   └── errors.js
│   │   ├── lib/
│   │   │   └── prisma.js            # Prisma client
│   │   ├── app.js                   # Express app config
│   │   └── server.js                # Server entry point
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── package.json
│   └── .env
│
├── .env.example                     # Environment variables template
├── .gitignore
└── README.md
```

## 🚀 Requirements

- Node.js 16+ and npm
- PostgreSQL 12+
- Git
- Stripe Account (for payments)
- Cloudinary Account (for image storage)

## 📦 Installation

### 1. Clone and Setup

```bash
cd amazon
npm install
```

### 2. Database Setup

Ensure PostgreSQL is running locally:

```bash
# Linux/Mac
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
# Run installer and remember your root password
```

Create a database:

```bash
psql -U postgres -c "CREATE DATABASE shopsphere;"
```

### 3. Environment Variables

Create `.env` in the server directory, or use a repository-root `.env` as a fallback. Server-specific values take precedence:

```
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopsphere"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRE="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # provided by Stripe CLI during local testing

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Server & Client
PORT=5000
CLIENT_URL="http://localhost:5173"

# Node Environment
NODE_ENV="development"
```

### 4. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## 🗄️ Database Setup

### Run Prisma Migrations

```bash
cd server
npx prisma migrate dev --name init
```

### Seed Sample Data (Optional)

```bash
cd server
npx prisma db seed
```

## ▶️ Running the Application

### Start Backend (Terminal 1)

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend (Terminal 2)

```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔌 API Overview

### Authentication

```
POST /api/auth/register          - Create new account
POST /api/auth/login             - Login user
POST /api/auth/logout            - Logout user
GET  /api/auth/me                - Get current user
PATCH /api/auth/me               - Update current user's profile
POST /api/auth/refresh          - Refresh JWT token
```

### Products

```
GET    /api/products             - List all products (with filtering)
GET    /api/products/:id         - Get product details
POST   /api/products             - Create product (Admin)
PUT    /api/products/:id         - Update product (Admin)
DELETE /api/products/:id         - Delete product (Admin)
GET    /api/products/search      - Search products
```

### Categories

```
GET    /api/categories           - List categories
POST   /api/categories           - Create category (Admin)
PUT    /api/categories/:id       - Update category (Admin)
DELETE /api/categories/:id       - Deactivate category (Admin)
```

### Cart

```
GET    /api/cart                 - Get user's cart
POST   /api/cart/items           - Add item to cart
PUT    /api/cart/items/:id       - Update cart item quantity
DELETE /api/cart/items/:id       - Remove item from cart
DELETE /api/cart                 - Clear cart
```

### Wishlist

```
GET    /api/wishlist             - Get user's wishlist
POST   /api/wishlist             - Add product to wishlist
DELETE /api/wishlist/:productId  - Remove from wishlist
```

### Account & Addresses

```
GET    /api/addresses            - List current user's saved addresses
POST   /api/addresses            - Save an address
PATCH  /api/addresses/:id        - Update an owned address or set it as default
DELETE /api/addresses/:id        - Remove an owned address
```

### Orders

```
POST   /api/orders               - Create order
GET    /api/orders               - Get user's orders
GET    /api/orders/:id           - Get order details
POST   /api/orders/:id/checkout-session - Create or reuse a Stripe Checkout session
POST   /api/payments/webhook     - Verify Stripe events and update payment status
PUT    /api/orders/:id/status    - Update order status (Admin)
```

### Reviews

```
GET    /api/products/:id/reviews - Get product reviews
POST   /api/products/:id/reviews - Create review
PUT    /api/reviews/:id          - Update review
DELETE /api/reviews/:id          - Delete review
```

### Admin

```
GET    /api/admin/categories     - List all categories, including hidden categories
GET    /api/admin/users          - Search and page through customer accounts
PATCH  /api/admin/users/:id/status - Activate or deactivate a customer account
GET    /api/admin/dashboard      - Dashboard stats
GET    /api/admin/orders         - List all orders
GET    /api/admin/reviews        - List all reviews
POST   /api/uploads/products      - Upload up to 8 JPG, PNG, or WebP images (10 MB each)

```

## 🧪 Testing

### Run Backend Tests

```bash
cd server
npm test
```

## 📊 Pages & Routes

### Public Pages

- `/` - Homepage
- `/products` - Products listing
- `/products/:id` - Product details
- `/search` - Search results
- `/category/:name` - Category products
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/order-confirmation/:id` - Order confirmation
- `/about` - About page
- `/contact` - Contact page

### Authenticated Pages

- `/profile` - User profile
- `/profile/edit` - Edit profile
- `/orders` - My orders
- `/orders/:id` - Order details
- `/wishlist` - Wishlist
- `/reviews` - My reviews

### Admin Pages (Role-based)

- `/admin` - Admin dashboard
- `/admin/products` - Manage products
- `/admin/products/new` - Add product
- `/admin/products/:id/edit` - Edit product
- `/admin/categories` - Manage categories
- `/admin/users` - Manage users
- `/admin/orders` - Manage orders
- `/admin/reviews` - Manage reviews

## 🔐 Authentication & Authorization

### Roles

- **CUSTOMER** - Regular user
- **ADMIN** - Administrator

### Protected Routes

- Cart endpoints → Requires authentication
- Order endpoints → Requires authentication
- Wishlist endpoints → Requires authentication
- Admin endpoints → Requires ADMIN role

## 💳 Payment Integration

Stripe Checkout uses server-calculated order amounts. Orders remain pending until a signed Stripe webhook verifies payment; successful payment marks the order paid and confirms pending orders. Set test credentials in `server/.env` before trying checkout.

For local webhook testing, install and authenticate the Stripe CLI, then run:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `server/.env`, add your Stripe test secret as `STRIPE_SECRET_KEY`, and restart the backend. Use Stripe's documented test card numbers in Checkout; never use live keys for local testing.

## 📸 Image Management

Cloudinary is used for product image storage:

- Upload product images during product creation
- Support for multiple images per product
- Automatic image optimization
- CDN delivery

## 🔄 Development Process (15 Phases)

1. ✅ **PHASE 1**: Project setup and folder structure
2. ⏳ **PHASE 2**: PostgreSQL + Prisma schema
3. ⏳ **PHASE 3**: Backend Express setup
4. ⏳ **PHASE 4**: Authentication
5. ⏳ **PHASE 5**: Product and category APIs
6. ⏳ **PHASE 6**: React frontend and routing
7. ⏳ **PHASE 7**: Homepage and product pages
8. ⏳ **PHASE 8**: Search, filtering, and sorting
9. ⏳ **PHASE 9**: Cart and wishlist
10. ⏳ **PHASE 10**: Checkout and orders
11. ⏳ **PHASE 11**: Stripe payment
12. ⏳ **PHASE 12**: Reviews and ratings
13. ⏳ **PHASE 13**: Admin dashboard
14. ⏳ **PHASE 14**: Security, validation, error handling
15. ⏳ **PHASE 15**: Testing and deployment

## 📝 Useful Commands

```bash
# Database
npx prisma migrate dev              # Create migration
npx prisma migrate deploy           # Deploy migrations
npx prisma studio                   # Open Prisma Studio
npx prisma db seed                  # Seed database

# Frontend
npm run dev                          # Start dev server
npm run build                        # Build for production
npm run preview                      # Preview production build

# Backend
npm run dev                          # Start dev server with nodemon
npm run build                        # Build for production
npm test                             # Run tests
npm run lint                         # Run linter
```

## 🚀 Production Deployment

### Prerequisites

- MongoDB Atlas or managed PostgreSQL (e.g., Heroku, Render, Railway)
- Stripe production keys
- Cloudinary production account
- Frontend hosting (Vercel, Netlify)
- Backend hosting (Heroku, Render, Railway, DigitalOcean)

### Steps

1. Update `.env` with production URLs
2. Build frontend: `npm run build`
3. Deploy backend with production DATABASE_URL
4. Deploy frontend (built files)
5. Update CORS and API URLs
6. Test all features in production

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000    # Windows
```

### Database Connection Error

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `psql -l`

### CORS Issues

- Check CLIENT_URL in .env
- Verify CORS middleware in app.js

## 📄 License

This is an educational project.

## 👥 Author

Built as a demonstration of full-stack e-commerce development.

---

**Let's build ShopSphere! 🚀**


<!-- Admin: admin@shopsphere.com / Admin123!
Customer: customer@shopsphere.com / Customer123! -->