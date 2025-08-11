# Authentication Backend

A complete authentication system with OTP validation, built with Node.js, Express, and MongoDB.

## Features

- User registration with email verification via OTP
- Secure login with JWT tokens stored in HTTP-only cookies
- Rate limiting to prevent abuse
- Input validation and sanitization
- Password hashing with bcrypt
- MongoDB integration with Mongoose

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- SMTP email service (Gmail, SendGrid, etc.)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Configure environment variables in `.env`:
```env
# Database
MONGO_URI=mongodb://localhost:27017/auth_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# SMTP Configuration for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Environment
NODE_ENV=development
PORT=5000

# Rate Limiting
OTP_RATE_LIMIT_WINDOW=60000
OTP_RATE_LIMIT_MAX=3
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### POST `/api/auth/signup`
Register a new user and send OTP.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "confirmPassword": "password123",
  "aadharNumber": "123456789012"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "OTP sent to your email. Please check and validate.",
  "otpId": "otp_id_here"
}
```

#### POST `/api/auth/validate-otp`
Validate OTP and activate user account.

**Request Body:**
```json
{
  "otpId": "otp_id_here",
  "otp": "123456"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Email verified successfully",
  "firstName": "John"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Login successful",
  "firstName": "John"
}
```

#### GET `/api/auth/me`
Get current user information (requires authentication).

**Response:**
```json
{
  "ok": true,
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/logout`
Logout and clear authentication cookie.

**Response:**
```json
{
  "ok": true,
  "message": "Logged out successfully"
}
```

## Security Features

### JWT Tokens
- Stored in HTTP-only cookies
- 7-day expiration
- Secure in production (HTTPS required)
- SameSite: 'lax' for CSRF protection

### Rate Limiting
- OTP requests: 3 per minute per email
- Login attempts: 5 per 15 minutes per email
- Signup attempts: 3 per hour per IP

### Password Security
- Bcrypt hashing with salt rounds of 12
- Minimum 6 characters required
- Password confirmation validation

### OTP Security
- 6-digit numeric OTP
- 10-minute expiration
- Maximum 5 failed attempts
- One-time use only
- Hashed storage in database

## Error Handling

All endpoints return consistent error responses:

```json
{
  "ok": false,
  "message": "Error description"
}
```

For validation errors:
```json
{
  "ok": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | `7d` |
| `SMTP_HOST` | SMTP server host | Yes | - |
| `SMTP_PORT` | SMTP server port | Yes | - |
| `SMTP_USER` | SMTP username | Yes | - |
| `SMTP_PASS` | SMTP password | Yes | - |
| `FROM_EMAIL` | Sender email address | Yes | - |
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `OTP_RATE_LIMIT_WINDOW` | OTP rate limit window (ms) | No | `60000` |
| `OTP_RATE_LIMIT_MAX` | OTP rate limit max requests | No | `3` |

## Database Models

### User Model
- `firstName`, `lastName`: String (required)
- `email`: String (unique, required)
- `phone`: String (10 digits, required)
- `passwordHash`: String (hashed, required)
- `aadharNumber`: String (12 digits, required)
- `isActive`: Boolean (default: false)
- `createdAt`, `updatedAt`: Timestamps

### OTP Model
- `userId`: ObjectId (reference to User)
- `otpHash`: String (hashed OTP)
- `expiresAt`: Date (auto-expires)
- `attempts`: Number (max: 5)
- `isUsed`: Boolean (default: false)
- `createdAt`, `updatedAt`: Timestamps

## Testing

Run the health check endpoint to verify server status:
```bash
curl http://localhost:5000/health
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use HTTPS in production
3. Configure proper CORS origins
4. Use strong JWT secret
5. Set up proper MongoDB connection
6. Configure SMTP with production credentials
