# Password Rotation & History Policy - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Run Database Migration
```bash
cd backend
npx prisma migrate deploy
```

This creates the `PasswordHistory` table and adds `lastPasswordChange` to the User table.

### Step 2: Update Your Login Component

In your login handler, check for password rotation requirement:

```typescript
// After successful login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

// Store tokens
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// Check if password rotation is required
if (data.passwordRotationRequired) {
  setShowPasswordRotation(true);
}
```

### Step 3: Add Password Rotation Modal to Your App

```typescript
import { PasswordRotationModal } from '@/components/PasswordRotationModal';
import { usePasswordRotation } from '@/hooks/usePasswordRotation';

export function App() {
  const [showPasswordRotation, setShowPasswordRotation] = useState(false);
  const { changePassword, isLoading, error } = usePasswordRotation();

  const handlePasswordChange = async (current: string, newPass: string) => {
    await changePassword(current, newPass);
    setShowPasswordRotation(false);
    // Optionally redirect or show success message
  };

  return (
    <>
      {/* Your app content */}
      <PasswordRotationModal
        isOpen={showPasswordRotation}
        onClose={() => setShowPasswordRotation(false)}
        onSubmit={handlePasswordChange}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
```

---

## 📋 What Was Implemented

### Backend
- ✅ `PasswordHistory` model to track previous passwords
- ✅ `lastPasswordChange` field on User model
- ✅ `PasswordHistoryService` with rotation and reuse checks
- ✅ `POST /api/auth/change-password` endpoint
- ✅ Audit logging for all password changes

### Frontend
- ✅ `PasswordRotationModal` component
- ✅ `usePasswordRotation` hook for API integration

---

## 🔐 How It Works

### Password Rotation (90 days)
1. User logs in
2. Backend checks if `lastPasswordChange` was > 90 days ago
3. If yes, returns `passwordRotationRequired: true`
4. Frontend shows modal prompting password change

### Password Reuse Prevention (Last 5)
1. User submits new password
2. Backend hashes it and compares against last 5 stored hashes
3. If match found, rejects with error message
4. If no match, records change and updates `lastPasswordChange`

---

## 🧪 Testing

### Test Password Rotation
```bash
# Manually update a user's lastPasswordChange to 91 days ago
UPDATE "User" SET "lastPasswordChange" = NOW() - INTERVAL '91 days' WHERE id = '<user-id>';

# Login - should see passwordRotationRequired: true
```

### Test Password Reuse Prevention
```bash
# Try to change password to an old one
POST /api/auth/change-password
{
  "currentPassword": "current123",
  "newPassword": "old_password_from_history"
}
# Should get: "Cannot reuse one of your last 5 passwords"
```

### Test Successful Password Change
```bash
POST /api/auth/change-password
{
  "currentPassword": "current123",
  "newPassword": "brand_new_password_456"
}
# Should get: "Password changed successfully"
```

---

## 📊 API Reference

### POST /api/auth/login
**Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
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

**Success Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:
- 400: Password reuse detected
- 401: Current password incorrect or unauthorized
- 404: User not found

---

## ⚙️ Configuration

To adjust rotation policy, edit `backend/src/services/PasswordHistoryService.ts`:

```typescript
const PASSWORD_ROTATION_DAYS = 90;      // Change rotation period
const PASSWORD_HISTORY_LIMIT = 5;       // Change history limit
const SALT_ROUNDS = 12;                 // Change bcrypt rounds
```

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- Comparison is constant-time (prevents timing attacks)
- All password changes are audit logged
- Change-password endpoint requires valid JWT
- Minimum password length: 8 characters

---

## 📚 Full Documentation

See `IMPLEMENTATION_PASSWORD_ROTATION.md` for detailed implementation info.

---

## ✅ Checklist

- [ ] Run database migration
- [ ] Update login component
- [ ] Add PasswordRotationModal to app
- [ ] Test password rotation after 90 days
- [ ] Test password reuse prevention
- [ ] Verify audit logs
- [ ] Deploy to production

---

## 🆘 Troubleshooting

**Q: Migration fails**
- Ensure PostgreSQL is running
- Check database connection in `.env`
- Run `npx prisma db push` if needed

**Q: Change password returns 401**
- Verify access token is valid
- Check Authorization header format: `Bearer <token>`
- Ensure user exists in database

**Q: Modal doesn't show**
- Verify `passwordRotationRequired` is true in login response
- Check localStorage for accessToken
- Verify modal component is imported correctly

---

## 📞 Support

For issues or questions, refer to the implementation documentation or check audit logs for password change attempts.
