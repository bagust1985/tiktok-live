---
name: Super Admin System
overview: Implementasi sistem Super Admin dengan role-based access control. Super Admin dapat mengelola admin accounts dan memiliki full access, sedangkan Admin biasa hanya bisa akses Dashboard dan Transactions.
todos:
  - id: db-schema
    content: Add admin_role field to User schema and run migration
    status: completed
  - id: backend-middleware
    content: Update admin middleware and create super admin middleware
    status: completed
    dependencies:
      - db-schema
  - id: backend-routes
    content: Add admin management endpoints and protect routes by role
    status: completed
    dependencies:
      - backend-middleware
  - id: update-script
    content: Update create-admin script to support role parameter
    status: completed
    dependencies:
      - db-schema
  - id: frontend-types
    content: Update TypeScript types and admin store for roles
    status: completed
  - id: frontend-api
    content: Add admin management API functions to api-admin.ts
    status: completed
    dependencies:
      - frontend-types
  - id: sidebar-menu
    content: Update sidebar with role-based menu items
    status: completed
    dependencies:
      - frontend-types
  - id: admin-page
    content: Create Admin Management page with CRUD functionality
    status: completed
    dependencies:
      - frontend-api
      - sidebar-menu
  - id: route-protection
    content: Add route protection for super admin-only pages
    status: completed
    dependencies:
      - frontend-types
  - id: testing
    content: Test role-based access control and migrations
    status: completed
    dependencies:
      - admin-page
      - route-protection
---

# Super Admin System Implementation

## Database Changes

### 1. Update User Schema

Add `admin_role` field to differentiate between SUPER_ADMIN and ADMIN:

- Modify [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
- Add: `admin_role String? // 'SUPER_ADMIN' or 'ADMIN'`
- Migration: `bun run prisma migrate dev --name add_admin_role`

## Backend API

### 2. Update Admin Middleware

Modify [`backend/src/middleware/admin.ts`](backend/src/middleware/admin.ts):

- Check `is_admin` flag (existing)
- Return `admin_role` in context
- Keep backward compatible

### 3. Create Super Admin Middleware

New file `backend/src/middleware/super-admin.ts`:

- Check if user has `admin_role = 'SUPER_ADMIN'`
- Return 403 if not super admin

### 4. Admin Management Endpoints

Add routes to [`backend/src/routes/admin.ts`](backend/src/routes/admin.ts):

- `GET /admin/admins` - List all admins (super admin only)
- `POST /admin/admins` - Create new admin (super admin only)
- `PUT /admin/admins/:id` - Update admin role (super admin only)
- `DELETE /admin/admins/:id` - Delete admin (super admin only)

### 5. Protect Routes by Role

Update [`backend/src/routes/admin.ts`](backend/src/routes/admin.ts):

- Users routes: require super admin
- Tasks routes: require super admin
- Settings routes (banks, contacts): require super admin
- Stats & Transactions: keep accessible to all admins

### 6. Update create-admin Script

Modify [`backend/scripts/create-admin.ts`](backend/scripts/create-admin.ts):

- Add parameter for creating super admin
- Default: create SUPER_ADMIN
- Support creating regular ADMIN

## Frontend Changes

### 7. Update Types

Modify [`types/user.ts`](types/user.ts):

- Add `admin_role?: 'SUPER_ADMIN' | 'ADMIN'` to User interface

### 8. Update Admin Store

Modify [`store/adminStore.ts`](store/adminStore.ts):

- Store `admin_role` in admin state
- Add helper: `isSuperAdmin()`

### 9. API Client Functions

Add to [`lib/api-admin.ts`](lib/api-admin.ts):

- `getAdmins()` - List admins
- `createAdmin(data)` - Create new admin
- `updateAdminRole(id, role)` - Update admin role
- `deleteAdmin(id)` - Delete admin

### 10. Admin Sidebar with Role-based Menu

Update [`components/admin/layout/AdminSidebar.tsx`](components/admin/layout/AdminSidebar.tsx):

- Show different menu items based on role
- Super Admin: Dashboard, Transactions, Users, Tasks, Settings, **Admin Management**
- Regular Admin: Dashboard, Transactions only
- Add shield icon for Admin Management

### 11. Route Protection Component

New file `components/admin/layout/SuperAdminRoute.tsx`:

- Wrapper for super admin-only pages
- Redirect to /admin/dashboard if not super admin

### 12. Admin Management Page

New file `app/(admin)/admin/admins/page.tsx`:

- List all admin accounts
- Search functionality
- Add Admin button
- Table with: Email, Role (badge), Created date, Actions (edit/delete)
- Show count: "X items total"

### 13. Add/Edit Admin Dialog

Component in `app/(admin)/admin/admins/page.tsx`:

- Form with: Email, Password, Role (SUPER_ADMIN/ADMIN)
- Validation
- Success/error toast

### 14. Protected Pages

Wrap super-admin-only pages:

- [`app/(admin)/admin/users/page.tsx`](app/\\\\(admin)/admin/users/page.tsx) - Add SuperAdminRoute
- [`app/(admin)/admin/tasks/page.tsx`](app/\\\\(admin)/admin/tasks/page.tsx) - Add SuperAdminRoute
- [`app/(admin)/admin/settings/page.tsx`](app/\\\\(admin)/admin/settings/page.tsx) - Add SuperAdminRoute

## Testing & Migration

### 15. Database Migration

- Run migration to add `admin_role` field
- Update existing admin to SUPER_ADMIN via script
- Test creating regular admin

### 16. Test Access Control

- Login as super admin → verify full access
- Login as regular admin → verify limited access (dashboard, transactions only)
- Verify protected routes redirect properly

## Summary

**Changes Required:**

- 1 database field (`admin_role`)
- 2 middleware files (1 update, 1 new)
- Backend routes protection
- New admin management page
- Role-based sidebar menu
- Route protection components

**Access Matrix:**
| Feature | Super Admin | Admin |
|---------|-------------|-------|
| Dashboard | ✅ | ✅ |
| Transactions | ✅ | ✅ |
| Users | ✅ | ❌ |
| Tasks | ✅ | ❌ |
| Settings | ✅ | ❌ |
| Admin Management | ✅ | ❌ |