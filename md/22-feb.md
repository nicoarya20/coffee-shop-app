## Authentication for both users and admins is implemented, featuring a backend update, a new Login page, and protected routes.

I have completed the following:
1. Branch Creation: Created and switched to the auth branch.
2. Database Updates: Added password and role fields to the User model in prisma/schema.prisma and regenerated the Prisma client.
3. Backend Implementation:
    * Installed bcrypt for secure password handling.
    * Added login and register handlers in server/handlers.ts.
    * Added /api/auth/login and /api/auth/register routes in server/routes.ts.
4. Frontend Implementation:
    * Updated the User type in src/app/types/index.ts.
    * Enhanced the API client in src/app/api/client.ts with authentication methods.
    * Created AuthContext to manage user state and authentication logic.
    * Wrapped the application with AuthProvider in src/app/App.tsx.
    * Created a modern, dual-purpose Login page at src/app/pages/Login.tsx.
    * Configured route protection in src/app/routes.tsx for Profile, Settings, and Admin pages.
    * Updated src/app/pages/Profile.tsx to use real authentication data and provide logout functionality.


You can now navigate to /login to sign in as either a User or an Admin.

## I've completed the user registration and admin seeder.
- Admin Seeder: Created prisma/seed.ts with credentials admin@coffee.com / adminpassword and user@coffee.com / userpassword, updated package.json, and seeded the database.
- Registration Page: Developed src/app/pages/Register.tsx with fields for name, email, phone, and password.
- Routing & Navigation: Added the /register route to src/app/routes.tsx and linked it from the Login page.