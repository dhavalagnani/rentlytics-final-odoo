# Rentlytics - Post-Hackathon Production Ready

video link:- https://drive.google.com/drive/folders/1nDE94eMSZXRrQrjGelg8U347tJedepXa?usp=drive_link

A full-stack authentication system with OTP validation, built with React + Vite frontend and Node.js + Express backend with MongoDB.

## 🚀 Features

### Core Features

- **User Authentication & Authorization**

  - JWT-based authentication with secure cookie handling
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - Session management with automatic token refresh

- **Product Management**

  - CRUD operations for rental products
  - Image upload with Cloudinary integration
  - Category-based organization
  - Availability tracking and conflict detection

- **Booking System**

  - Real-time availability checking
  - Automated scheduling with conflict prevention
  - Pickup and return confirmation workflows
  - Status tracking (Pending, Confirmed, Active, Completed, Cancelled)

- **Dynamic Pricing Engine**

  - Rule-based pricing with multiple conditions
  - Seasonal pricing adjustments
  - Demand-based pricing
  - Bulk pricing for extended rentals

- **Payment Processing**

  - Multiple payment gateways (Razorpay, Stripe)
  - Secure payment verification
  - Transaction history and receipts
  - Refund processing

- **Analytics & Reporting**

  - Real-time dashboard with key metrics
  - Booking analytics and trends
  - Revenue reports and forecasting
  - Export functionality (CSV, PDF)

- **Notification System**

  - Email notifications for booking updates
  - SMS/WhatsApp reminders via Twilio
  - Automated pickup and return reminders
  - Custom notification preferences

- **Penalty Management**
  - Configurable late return penalties
  - Damage assessment and charges
  - Automated penalty calculation
  - Payment integration for penalties

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies
- **File Upload**: Multer with Cloudinary
- **Payment**: Razorpay & Stripe integration
- **Email**: Nodemailer with SMTP
- **SMS**: Twilio API
- **Validation**: Express-validator
- **Rate Limiting**: Express-rate-limit

### Frontend

- **Framework**: React 18 with Vite
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with CSS3
- **Charts**: Chart.js for analytics
- **File Upload**: Drag & drop interface

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dhavalagnani/rentlytics-final-odoo.git
cd rentlytics-final-odoo
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration
# See Environment Variables section below
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API base URL
VITE_API_BASE=http://localhost:5000
```

### 4. Database Setup

```bash
# Start MongoDB (if not running)
mongod

# The application will automatically create collections
# No manual database setup required
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
MONGO_URI=mongodb://localhost:27017/rentlytics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_EXPIRES_MS=604800000

# Environment
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@rentlytics.com

# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Frontend (.env.local)

```env
VITE_API_BASE=http://localhost:5000
VITE_CLIENT_ID=your_client_id
```

## 🧪 Testing

### Smoke Tests

```bash
# Run comprehensive API tests
cd backend
npm run smoke

# Run curl-based tests
npm run smoke:curl
```

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication flow
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","password":"password123","aadharNumber":"123456789012"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Test protected endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/refresh` - Refresh JWT token (protected)
- `POST /api/auth/logout` - User logout

### Product Endpoints

- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Booking Endpoints

- `GET /api/bookings` - Get all bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `POST /api/bookings` - Create booking (protected)
- `PUT /api/bookings/:id` - Update booking (protected)
- `POST /api/bookings/:id/pickup` - Confirm pickup (protected)
- `POST /api/bookings/:id/return` - Confirm return (protected)

### Payment Endpoints

- `POST /api/payment/create-order` - Create payment order (protected)
- `POST /api/payment/verify` - Verify payment (protected)
- `GET /api/payment/status/:orderId` - Get payment status (protected)

### Analytics Endpoints

- `GET /api/user/dashboard` - Get user dashboard (protected)
- `GET /api/user/bookings/report` - Get booking report (protected)
- `GET /api/user/transactions/report` - Get transaction report (protected)
- `GET /api/user/analytics/products` - Get product analytics (protected)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **HTTP-Only Cookies**: XSS protection for tokens
- **Environment Variables**: Secure configuration management

## 🚀 Production Deployment

### Backend Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Environment variables for production
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
# Update VITE_API_BASE to your production API URL
```

## 📁 Project Structure

```
rentlytics-final-odoo/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Custom middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── utils/               # Helper functions
│   ├── scripts/             # Utility scripts
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Changelog

### Post-Hackathon Cleanup (Latest)

- ✅ JWT authentication refactored for security
- ✅ API response normalization implemented
- ✅ Comprehensive error handling added
- ✅ Code cleanup and organization completed
- ✅ Environment configuration standardized
- ✅ Smoke tests and validation added
- ✅ Production-ready security measures implemented

---

**Built with ❤️ by the Rentlytics Team**
