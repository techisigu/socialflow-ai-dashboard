# Password Rotation & History Policy Implementation

## Overview
Implemented a comprehensive password rotation and reuse prevention policy that enforces password changes every 90 days and prevents users from reusing their last 5 passwords.

## Changes Made

### 1. Database Schema (Prisma)
**File**: `backend/prisma/schema.prisma`

- Added `lastPasswordChange` field to User model (tracks when password was last changed)
- Created new `PasswordHistory` model to store salted hashes of previous passwords
- Added indexes on `userId` and `createdAt` for efficient queries

**Migration**: `backend/prisma/migrations/1774456992_add_password_history/migration.sql`

### 2. Backend Services

#### PasswordHistoryService
**File**: `backend/src/services/PasswordHistoryService.ts`

Core functionality:
- `isRotationRequired(userId)`: Checks if 90+ days have passed since last password change
- `isPasswordReused(userId, newPassword)`: Validates new password against last 5 hashes using bcrypt comparison
- `recordPasswordChange(userId, newPasswordHash)`: Records password change, updates timestamp, and maintains history limit
- `hashPassword(password)`: Hashes password with bcrypt (12 salt rounds)

**Security Features**:
- Uses bcrypt for cryptographically sound password comparison
- Automatically prunes history to keep only last 5 entries
- Prevents timing attacks through consistent bcrypt comparison

### 3. Authentication Controller
**File**: `backend/src/controllers/auth.ts`

Updates:
- `login()`: Returns `passwordRotationRequired` flag in response
- `changePassword()`: New endpoint that:
  - Verifies current password
  - Checks for password reuse
  - Records password change with history
  - Logs audit trail

### 4. Authentication Routes
**File**: `backend/src/routes/auth.ts`

New endpoint:
- `POST /api/auth/change-password` - Requires authentication, validates schema

### 5. Authentication Schemas
**File**: `backend/src/schemas/auth.ts`

New schema:
- `changePasswordSchema`: Validates currentPassword and newPassword (min 8 chars)

### 6. Authentication Middleware
**File**: `backend/src/middleware/authenticate.ts`

New middleware for protecting authenticated endpoints:
- Extracts JWT from Authorization header
- Validates token and attaches user to request

### 7. Frontend Components

#### PasswordRotationModal
**File**: `src/components/PasswordRotationModal.tsx`

Modal component that:
- Displays password rotation requirement
- Collects current and new passwords
- Validates password confirmation
- Shows error messages
- Handles loading state

#### usePasswordRotation Hook
**File**: `src/hooks/usePasswordRotation.ts`

Hook that:
- Manages password change API calls
- Handles loading and error states
- Stores access token from localStorage
- Provides error handling

## Integration Steps

### 1. Run Database Migration
```bash
cd backend
npx prisma migrate deploy
```

### 2. Update Frontend Login Handler
In your login component, check the `passwordRotationRequired` flag:

```typescript
const response = await fetch('/api/auth/login', { /* ... */ });
const data = await response.json();

if (data.passwordRotationRequired) {
  // Show PasswordRotationModal
  setShowPasswordRotation(true);
}
```

### 3. Use Password Rotation Modal
```typescript
import { PasswordRotationModal } from '@/components/PasswordRotationModal';
import { usePasswordRotation } from '@/hooks/usePasswordRotation';

export function LoginPage() {
  const { changePassword, isLoading, error } = usePasswordRotation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <PasswordRotationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={changePassword}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
```

## Security Considerations

1. **Cryptographic Hashing**: Uses bcrypt with 12 salt rounds for password hashing
2. **Timing Attack Prevention**: bcrypt comparison is constant-time
3. **History Limit**: Maintains only last 5 passwords to prevent brute force
4. **Audit Logging**: All password changes are logged via auditLogger
5. **Token-Based Auth**: Change password endpoint requires valid JWT
6. **Password Validation**: Minimum 8 characters enforced at schema level

## Configuration

Password rotation policy constants (in `PasswordHistoryService.ts`):
- `PASSWORD_ROTATION_DAYS = 90`: Days before rotation required
- `PASSWORD_HISTORY_LIMIT = 5`: Number of previous passwords to track
- `SALT_ROUNDS = 12`: Bcrypt salt rounds for hashing

## API Endpoints

### POST /api/auth/login
**Response** (on success):
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "passwordRotationRequired": false
}
```

### POST /api/auth/change-password
**Headers**: `Authorization: Bearer <accessToken>`

**Request**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response** (on success):
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:
- 401: Current password incorrect or unauthorized
- 400: Password reuse detected
- 404: User not found

## Testing Recommendations

1. Test password rotation requirement after 90 days
2. Test password reuse prevention with last 5 passwords
3. Test password change with invalid current password
4. Test concurrent password change attempts
5. Test audit logging for password changes
6. Test frontend modal display on login with rotation required

## Commit Message
```
security: implement password rotation and reuse prevention policy

- Add PasswordHistory model to track previous passwords
- Add lastPasswordChange field to User model
- Implement PasswordHistoryService with rotation and reuse checks
- Add change-password endpoint with authentication
- Add frontend modal and hook for password rotation
- Enforce 90-day rotation policy with 5-password history limit
- Use bcrypt for cryptographically sound password comparison
```
