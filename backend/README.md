# Odoo Rental Backend

A comprehensive Node.js + Express + MongoDB backend for a rental management system with Stripe payments and Cloudinary image storage.

## Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- User registration and login
- Role-based access control (users, owners, admins)

### 📊 Dashboard & Analytics

- User dashboard with rental statistics
- Booking and transaction reports
- Product analytics
- CSV export functionality

### 💳 Payment Integration

- Stripe payment processing
- Full and partial payment support
- Payment history tracking
- Refund processing
- Webhook handling

### 🖼️ Image Management

- Cloudinary integration for image storage
- Product catalog images
- User profile pictures
- Automatic image optimization

### 📦 Product Management

- Product catalog with categories
- Dynamic pricing with rules
- Inventory management
- Image upload and management

### 📅 Booking System

- Rental booking management
- Date-based availability
- Pricing calculations
- Order processing

## Environment Setup

### Required Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/auth_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
PORT=5000

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=3

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (see above)

3. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Dashboard & Reports

- `GET /api/user/dashboard` - Get user dashboard data
- `GET /api/user/dashboard/download` - Download dashboard CSV
- `GET /api/user/bookings/report` - Get booking report
- `GET /api/user/transactions/report` - Get transaction report
- `GET /api/user/analytics/products` - Get product analytics
- `GET /api/user/stats` - Get user statistics

### User Profile Management

- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/profile/picture` - Update profile picture
- `PUT /api/user/password` - Change password

### Payments

- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/partial` - Process partial payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/webhook` - Stripe webhook handler

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (owners only)
- `PATCH /api/products/:id` - Update product (owners only)
- `DELETE /api/products/:id` - Delete product (owners only)
- `PATCH /api/products/:id/units` - Update product units
- `POST /api/products/:id/images` - Add product image
- `DELETE /api/products/:id/images/:imageIndex` - Remove product image

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Bookings

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction

### Pricelists & Price Rules

- `GET /api/pricelists` - Get all pricelists
- `POST /api/pricelists` - Create pricelist
- `PUT /api/pricelists/:id` - Update pricelist
- `DELETE /api/pricelists/:id` - Delete pricelist

- `GET /api/pricerules` - Get all price rules
- `POST /api/pricerules` - Create price rule
- `PUT /api/pricerules/:id` - Update price rule
- `DELETE /api/pricerules/:id` - Delete price rule

## File Upload

The API supports image uploads for:

- Product images (multiple images per product)
- User profile pictures

### Upload Limits

- Maximum file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP
- Automatic image optimization via Cloudinary

## Payment Processing

### Stripe Integration

- Test mode ready with test keys
- Support for full and partial payments
- Webhook handling for payment status updates
- Refund processing

### Payment Flow

1. Create payment intent with amount and order details
2. Process payment on frontend using Stripe Elements
3. Handle webhook events for payment confirmation
4. Update order and booking status accordingly

## Error Handling

The API uses centralized error handling with:

- Consistent error response format
- Proper HTTP status codes
- Detailed error messages in development
- Security-conscious error responses in production

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- File upload security

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run fix-db` - Fix database issues

### Testing

The backend includes test environment configuration in `test.env` for isolated testing.

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up production Stripe keys
4. Configure Cloudinary production credentials
5. Set up proper CORS origins
6. Configure webhook endpoints

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.
