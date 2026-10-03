@echo off
echo ================================================
echo ShopSphere Database Setup Script
echo ================================================
echo.

echo Step 1: Generating Prisma Client...
cd /d "%~dp0server"
call npm run prisma:generate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

echo Step 2: Running Database Migrations...
call npm run prisma:migrate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)
echo.

echo Step 3: Seeding Database with Sample Data...
call npm run prisma:seed
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)
echo.

echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo You can now run your application:
echo   - Backend:  cd server ^& npm run dev
echo   - Frontend: cd client ^& npm run dev
echo.
echo Test Accounts Created:
echo   Admin:    admin@shopsphere.com / Admin@123
echo   Customer: customer@shopsphere.com / Customer@123
echo.
pause
