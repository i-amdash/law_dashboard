# Database and API Updates for User Profile

This document outlines the database schema changes and API updates needed to support the new user profile features.

## Database Schema Changes

The following columns have been added to the `users` table:

```sql
ALTER TABLE users ADD COLUMN height VARCHAR(255);
ALTER TABLE users ADD COLUMN cap_size VARCHAR(10);
ALTER TABLE users ADD COLUMN shirt_size VARCHAR(10);
ALTER TABLE users ADD COLUMN profile_image TEXT;
```

These columns store the following information:
- `height`: User's height in centimeters (e.g., "175")
- `cap_size`: User's cap size (e.g., "S", "M", "L", "XL")
- `shirt_size`: User's shirt size (e.g., "XS", "S", "M", "L", "XL", "XXL")
- `profile_image`: URL to the user's profile image (stored in Cloudinary)

## API Endpoints Updated

The following API endpoints have been updated to support the new fields:

### 1. `/api/auth/register` (POST)

Now accepts additional fields:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "optional-password",
  "height": "175",
  "cap_size": "M",
  "shirt_size": "L",
  "profile_image": "https://cloudinary.com/image-url"
}
```

### 2. `/api/auth/profile` (GET)

Now returns additional fields in the user object:
```json
{
  "user": {
    "id": "user-id",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "height": "175",
    "cap_size": "M",
    "shirt_size": "L",
    "profile_image": "https://cloudinary.com/image-url",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### 3. `/api/auth/update-profile` (PUT)

New endpoint created to update user profile information:
```json
{
  "userId": "user-id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "height": "175",
  "cap_size": "M",
  "shirt_size": "L",
  "profile_image": "https://cloudinary.com/image-url"
}
```

### 4. `/api/[storeId]/checkout` (POST)

Updated to accept and store the new user fields when creating an account during checkout:
```json
{
  "productIds": ["product-id-1", "product-id-2"],
  "productGenders": ["male", "female"],
  "email": "john@example.com",
  "phone": "1234567890",
  "fullName": "John Doe",
  "address": "123 Main St",
  "height": "175",
  "capSize": "M",
  "shirtSize": "L",
  "profileImage": "https://cloudinary.com/image-url",
  "createAccount": true
}
```

## How to Apply Database Changes

Run the SQL migration script located at:
`/supabase/migrations/add_user_profile_fields.sql`

This can be done through the Supabase dashboard or using the Supabase CLI:

```bash
supabase db execute --file=supabase/migrations/add_user_profile_fields.sql
```
