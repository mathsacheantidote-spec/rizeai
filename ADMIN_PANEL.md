# Admin Panel Documentation

## Overview

The RizeAI Admin Panel provides comprehensive user and role management capabilities for administrators. It is built with Supabase Auth for authentication and Supabase PostgreSQL database for data persistence.

## Features

### 1. Admin Login Page (`/admin-login`)

The dedicated admin login page supports both sign-in and sign-up functionality:

- **Email/Password Authentication**: Users can sign in with their email and password
- **Account Creation**: New admin accounts can be created (though they default to 'user' role)
- **Role-Based Access**: Only users with 'admin' role can access the admin panel
- **Session Persistence**: Authentication sessions are automatically persisted in browser storage
- **Automatic Redirection**: 
  - Admin users are automatically redirected to `/admin`
  - Non-admin users see an error message

### 2. Admin Panel Dashboard (`/admin`)

The protected admin dashboard provides a comprehensive interface for user management:

#### User Management Table

Displays all registered users with the following information:

| Column | Description |
|--------|-------------|
| Name | User's full name |
| Email | User's email address |
| Role | Current user role (user, mentor, admin) |
| Status | Account status (Active/Inactive) |
| Created | Account creation date |
| Actions | Management actions (deactivate/reactivate, delete) |

#### Role Management

- **Dropdown Selection**: Change user roles between 'user', 'mentor', and 'admin'
- **Instant Updates**: Role changes are immediately saved to the database
- **Validation**: Only admins can modify user roles

#### Account Management

- **Deactivate**: Temporarily disable a user account (sets `is_active` to false)
- **Reactivate**: Re-enable a deactivated account (sets `is_active` to true)
- **Delete**: Permanently remove a user from the system
- **Confirmation Dialog**: Delete actions require confirmation to prevent accidental removal

#### Additional Features

- **Logout**: Sign out from the admin panel
- **Success/Error Notifications**: Feedback for all user management actions
- **Loading States**: Visual indicators during async operations
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

### Profiles Table

The `profiles` table stores user information and roles:

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role public.user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### User Roles

Three role types are supported:

- **user**: Standard user with basic access
- **mentor**: Mentor role for mentoring capabilities
- **admin**: Administrator with full system access

### Row Level Security (RLS)

The profiles table is protected with RLS policies:

1. **Users can read their own profile**: Users can only view their own profile data
2. **Admins can read all profiles**: Admins can view all user profiles
3. **Users can update their own profile**: Users can modify their own data (except role)
4. **Admins can update all profiles**: Admins can modify any user's information
5. **Admins can delete profiles**: Only admins can delete user accounts

## Environment Variables

The following environment variables must be set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key
```

These are automatically configured during project setup.

## Authentication Flow

### Sign-In Process

1. User enters email and password on `/admin-login`
2. Credentials are validated against Supabase Auth
3. User profile is fetched from the `profiles` table
4. Role is checked - only 'admin' role users are allowed
5. On success, user is redirected to `/admin`
6. On failure, error message is displayed

### Sign-Up Process

1. User enters name, email, and password on `/admin-login`
2. New Supabase Auth user is created
3. Profile record is created in the `profiles` table with default 'user' role
4. Since new accounts are 'user' role by default, an error is shown
5. An existing admin must promote the account to 'admin' role via the admin panel

### Session Management

- Sessions are persisted in browser localStorage
- Sessions are automatically refreshed when expired
- Logout clears the session and redirects to `/admin-login`

## API Integration

The admin panel uses the following auth service functions (from `client/src/lib/auth.ts`):

### User Authentication

```typescript
signUp(email: string, password: string, name: string)
signIn(email: string, password: string)
signOut()
getCurrentUser()
```

### User Management

```typescript
getAllUsers()
updateUserRole(userId: string, role: 'user' | 'mentor' | 'admin')
deactivateUser(userId: string)
reactivateUser(userId: string)
deleteUser(userId: string)
```

## Navigation

### Admin Link

An "Admin Access" link is available in the footer of the home page (`/`), allowing easy navigation to `/admin-login`.

### Route Protection

The `/admin` route is protected with client-side authentication checks:

1. On page load, current user is fetched
2. If no user exists, redirect to `/admin-login`
3. If user is not admin, redirect to `/admin-login`
4. If user is admin, display the dashboard

## Security Considerations

### Authentication

- All authentication is handled by Supabase Auth with industry-standard security
- Passwords are never stored in the application
- Session tokens are securely managed by Supabase

### Authorization

- Role-based access control (RBAC) is enforced at the database level via RLS policies
- Admin-only operations are validated on both client and database levels
- Users cannot modify their own roles through the API

### Data Protection

- All sensitive operations require admin authentication
- User deletion is permanent and requires confirmation
- Account deactivation is reversible

## Troubleshooting

### Cannot Access Admin Panel

1. Verify your Supabase credentials are correctly set in environment variables
2. Ensure your user account has the 'admin' role
3. Check browser console for authentication errors
4. Clear browser cache and localStorage if experiencing persistent issues

### Database Migration Issues

If the migration fails:

1. Go to Supabase SQL Editor
2. Check for existing `profiles` table or `user_role` enum
3. Drop conflicting objects if necessary
4. Re-run the migration SQL

### Role Changes Not Persisting

1. Verify RLS policies are correctly set on the `profiles` table
2. Check that the current user has admin role
3. Review browser console for API errors
4. Verify database connection is active

## Future Enhancements

Potential improvements for future versions:

- Bulk user management operations
- User search and filtering
- Admin audit logs
- Two-factor authentication (2FA)
- User activity tracking
- Mentor assignment and management
- Platform analytics dashboard
- Email notifications for admin actions
