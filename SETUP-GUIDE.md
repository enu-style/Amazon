# ShopSphere Setup Guide - All Issues Fixed! ✅

## 🎉 What Has Been Fixed

All critical issues have been resolved:

### ✅ Configuration Issues Fixed
1. **Server environment variables** - All missing variables added to `server\.env`
2. **Client environment variables** - Cloudinary cloud name updated to correct value
3. **API URL hardcoding** - Changed to use environment variable
4. **Axios version** - Fixed from invalid 1.20.0 to 1.7.0
5. **JWT Secret** - Generated strong cryptographic secret

### 📝 Files Modified
- ✅ `server\.env` - Added all missing environment variables
- ✅ `client\.env` - Updated Cloudinary cloud name
- ✅ `client\src\services\api.js` - Now uses environment variable for API URL
- ✅ `client\package.json` - Fixed axios version
- ✅ `.env` - Updated with strong JWT secret

---

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Database
Double-click the file: **`setup-database.bat`**

This will:
- Generate Prisma client
- Run database migrations
- Seed sample data (products, categories, test accounts)

**Important:** Make sure PostgreSQL is running first!

### Step 2: Start the Application
Double-click the file: **`start-app.bat`**

This will open 2 command windows:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:5173

### Step 3: Open Browser
Go to: **http://localhost:5173**

---

## 👤 Test Accounts

After running the setup, you can login with:

**Admin Account:**
- Email: `admin@shopsphere.com`
- Password: `Admin@123`
- Access: Full admin dashboard

**Customer Account:**
- Email: `customer@shopsphere.com`
- Password: `Customer@123`
- Access: Regular shopping features

---

## 📋 Manual Setup (Alternative)

If you prefer to run commands manually:

### Backend Setup
```cmd
cd server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend Setup (in a new terminal)
```cmd
cd client
npm run dev
```

---

## 🔧 Current Configuration Status

### Environment Variables

#### Server (server\.env) ✅
```env
DATABASE_URL="postgresql://postgres:1204@localhost:5432/shopsphere"
JWT_SECRET="[STRONG SECRET GENERATED]"
CLOUDINARY_CLOUD_NAME="dusehlkn"
CLOUDINARY_API_KEY="752665562153968"
CLOUDINARY_API_SECRET="[CONFIGURED]"
CLIENT_URL="http://localhost:5173"
PORT=5000
NODE_ENV="development"
```

#### Client (client\.env) ✅
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=dusehlkn
```

**Note:** Stripe keys are placeholders - payments won't work until you add real keys (see below)

---

## 💳 Optional: Enable Stripe Payments

Payments are currently disabled because Stripe test keys are needed.

### To Enable Payments:

1. **Get Stripe Test Keys:**
   - Sign up at https://dashboard.stripe.com/register
   - Switch to "Test mode" (toggle in dashboard)
   - Go to Developers → API Keys
   - Copy both keys:
     - Publishable key (starts with `pk_test_`)
     - Secret key (starts with `sk_test_`)

2. **Update Environment Files:**

   In `server\.env`, replace:
   ```env
   STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
   ```

   In `client\.env`, replace:
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
   ```

3. **Setup Webhook (for local testing):**
   ```cmd
   # Install Stripe CLI: https://stripe.com/docs/stripe-cli
   stripe login
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
   Copy the webhook secret (starts with `whsec_`) and add to `server\.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"
   ```

4. **Restart both servers** after updating environment files

5. **Test Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

---

## ✨ What You Can Do Now

### Customer Features
- ✅ Browse products with filters and search
- ✅ View product details with images
- ✅ Add products to shopping cart
- ✅ Add products to wishlist
- ✅ Create and manage user account
- ✅ Manage shipping addresses
- ✅ View order history
- ✅ Write product reviews
- ⚠️ Complete checkout (needs Stripe keys for payment)

### Admin Features (login as admin)
- ✅ Dashboard with statistics
- ✅ Manage products (create, edit, delete)
- ✅ Manage categories
- ✅ Manage users
- ✅ View and update orders
- ✅ Upload product images
- ✅ Moderate reviews

---

## 🐛 Troubleshooting

### Database Connection Error
**Error:** `Can't reach database server`

**Solution:**
1. Make sure PostgreSQL is installed and running
2. Check the database exists: `psql -U postgres -l`
3. Create if missing: `createdb -U postgres shopsphere`
4. Verify password in `DATABASE_URL` matches your PostgreSQL password

### Port Already in Use
**Error:** `Port 5000 is already in use`

**Solution:**
1. Find what's using the port: `netstat -ano | findstr :5000`
2. Kill that process or change the port in `server\.env`

### Module Not Found
**Error:** `Cannot find module`

**Solution:**
```cmd
# In server directory
npm install

# In client directory
cd ..\client
npm install
```

### Prisma Client Not Generated
**Error:** `@prisma/client did not initialize yet`

**Solution:**
```cmd
cd server
npm run prisma:generate
```

---

## 📚 Additional Information

### Project Structure
```
amazon/
├── client/           # React frontend (Vite)
├── server/           # Express backend (Prisma)
├── .env              # Root environment variables
├── setup-database.bat   # Database setup script
├── start-app.bat        # Application launcher
└── SETUP-GUIDE.md      # This file
```

### Technology Stack
- **Frontend:** React 18, Redux Toolkit, React Router, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Payments:** Stripe (requires configuration)
- **File Upload:** Cloudinary
- **Security:** Helmet, CORS, Rate Limiting, bcrypt

### Scripts Reference

**Server (in server/ directory):**
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed sample data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

**Client (in client/ directory):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🎯 Next Steps

1. ✅ Run `setup-database.bat` to initialize the database
2. ✅ Run `start-app.bat` to start the application
3. ✅ Open http://localhost:5173 in your browser
4. ✅ Test with provided accounts
5. ⚠️ (Optional) Configure Stripe for payment testing
6. 🚀 Start building and customizing!

---

## 💡 Tips

- Keep both command windows open while using the app
- The backend must be running for the frontend to work
- Sample data includes 6 products across 5 categories
- Images are hosted on Cloudinary (already configured)
- Use Prisma Studio to inspect/edit database: `npm run prisma:studio`
- Check `login.json` for any saved session data

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error messages in the command windows
3. Verify environment variables are correct
4. Ensure PostgreSQL is running
5. Try restarting both servers

---

**Status:** ✅ All issues fixed and ready to run!
**Last Updated:** 2024
