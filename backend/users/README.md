# User Management for Admin Users

## Features

This module implements user management functionality for admin accounts, including:

1. **Viewing all user accounts** - Admin users can view a list of all accounts in the system
2. **Editing user accounts** - Admin users can edit any user account, including changing roles
3. **Deleting user accounts** - Admin users can delete any user account

## Usage

### Deleting User Accounts (Admin Only)

The system allows admin users to delete any user account. Regular users can only delete their own accounts.

#### Frontend

1. Navigate to the Admin panel
2. Click on "Manage Accounts" 
3. Find the user you want to delete in the accounts list
4. Click the "Delete" button next to the user
5. Confirm in the dialog that appears

#### API

**Endpoint:** `DELETE /accounts/:id`

**Authentication:** Requires valid JWT token

**Authorization:** 
- Admin users can delete any account
- Regular users can only delete their own account

**Response:**
- Success: `{ message: 'Account deleted successfully' }`
- Error: `{ message: 'Unauthorized' }` (if not admin and not own account)

**Example:**

```javascript
// Using fetch API
fetch('http://localhost:4000/accounts/123', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Testing

A test script is included to verify the functionality:

```bash
# Run the test script
npm test
```

The test verifies:
1. Admin users can delete any user account
2. Regular users cannot delete other user accounts (only their own) 