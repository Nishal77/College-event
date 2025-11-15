# Admin Panel Setup Instructions

## Creating Admin Account

To create an admin account, run the following command in the `api` directory:

```bash
npm run create-admin
```

This will create an admin account with the following credentials:
- **Email**: `admin@eventoems.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password after your first login!

## Accessing Admin Panel

1. Start the backend server:
   ```bash
   cd api
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173/admin
   ```

4. Login with the admin credentials created above

## Admin Panel Features

The admin panel includes:

- **Dashboard** - Overview of system statistics
  - Total Events
  - Total Tickets
  - Total Users
  - Recent Events list

- **Authentication** - Secure admin login
  - Protected routes
  - Token-based authentication
  - Logout functionality

## Admin Routes

- `/admin` - Admin login page
- `/admin/dashboard` - Main admin dashboard (protected)

## Security Notes

1. The admin panel uses token-based authentication
2. Tokens are stored in localStorage
3. Protected routes automatically redirect to login if not authenticated
4. Always use strong passwords in production
5. Consider implementing 2FA for additional security

## Future Enhancements

Planned features:
- User management page
- Event management (approve/reject)
- Ticket management
- Analytics and reports
- Settings page
- Admin profile management
