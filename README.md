# Complete Authentication System

A full-stack authentication system with OTP validation, built with React + Vite frontend and Node.js + Express backend with MongoDB.

## 🚀 Features

### Backend (Node.js + Express)
- User registration with email verification via OTP
- Secure JWT authentication with HTTP-only cookies
- MongoDB integration with Mongoose
- Rate limiting to prevent abuse
- Input validation and sanitization
- Password hashing with bcrypt
- Email sending with Nodemailer
- Comprehensive error handling

### Frontend (React + Vite)
- Modern React components with hooks
- Responsive design with Tailwind CSS
- OTP validation with countdown timer
- Toast notifications for user feedback
- Protected routes and authentication state
- Form validation with real-time feedback

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd odoo
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Configure environment variables in .env
# See backend/README.md for detailed configuration
```

**Required Environment Variables:**
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
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server:**
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Mode

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Start Backend:**
```bash
cd backend
npm start
```

## 🔐 Authentication Flow

### 1. User Registration
1. User fills signup form with required fields:
   - First Name, Last Name
   - Email (unique)
   - Phone (10 digits)
   - Password (min 6 chars)
   - Confirm Password
   - Aadhar Number (12 digits)

2. Backend validates input and creates inactive user
3. 6-digit OTP is generated and sent via email
4. Frontend redirects to OTP validation page

### 2. OTP Validation
1. User enters 6-digit OTP from email
2. 10-minute countdown timer shows remaining time
3. Backend validates OTP and activates user account
4. JWT token is set in HTTP-only cookie
5. User is redirected to dashboard

### 3. User Login
1. User enters email and password
2. Backend authenticates and sets JWT cookie
3. Frontend updates user state and redirects

### 4. Session Management
- JWT tokens stored in HTTP-only cookies (7 days)
- Automatic token validation on protected routes
- User state managed via React Context
- Secure logout with cookie clearing

## 📁 Project Structure

```
odoo/
├── backend/
│   ├── controllers/
│   │   └── authController.js      # Authentication logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── rateLimit.js          # Rate limiting
│   │   └── validation.js         # Input validation
│   ├── models/
│   │   ├── User.js               # User model
│   │   └── Otp.js                # OTP model
│   ├── routes/
│   │   └── auth.js               # Auth routes
│   ├── utils/
│   │   ├── jwt.js                # JWT utilities
│   │   └── mailer.js             # Email utilities
│   ├── server.js                 # Express server
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SignupForm.jsx    # Registration form
│   │   │   ├── LoginForm.jsx     # Login form
│   │   │   ├── ValidateOtp.jsx   # OTP validation
│   │   │   └── Navbar.jsx        # Updated navbar
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── services/
│   │   │   └── authService.js    # API service
│   │   └── App.jsx               # Main app component
│   ├── package.json
│   └── README.md
└── README.md
```

## 🔒 Security Features

### Backend Security
- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Tokens**: HTTP-only cookies with secure flags
- **Rate Limiting**: Prevents OTP and login abuse
- **Input Validation**: Server-side validation with express-validator
- **CORS Protection**: Configured for specific origins
- **OTP Security**: 6-digit, 10-minute expiry, max 5 attempts

### Frontend Security
- **Client Validation**: Real-time form validation
- **Secure Cookies**: Automatic handling via withCredentials
- **Error Handling**: Comprehensive error messages
- **State Management**: Secure user state via Context

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/validate-otp` - OTP validation
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check email spam folder
   - Ensure SMTP service allows app passwords

3. **CORS Errors**
   - Verify CORS configuration in backend
   - Check frontend API base URL

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check cookie settings in production

### Debug Mode
- Backend: Check console logs for detailed errors
- Frontend: Open browser dev tools for network requests
- Database: Use MongoDB Compass for data inspection

## 📚 API Documentation

### Signup Request
```json
POST /api/auth/signup
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

### OTP Validation Request
```json
POST /api/auth/validate-otp
{
  "otpId": "otp_id_here",
  "otp": "123456"
}
```

### Login Request
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up production SMTP credentials
4. Use strong JWT secret
5. Enable HTTPS

### Frontend Deployment
1. Update API base URL for production
2. Build with `npm run build`
3. Deploy `dist` folder to web server
4. Ensure HTTPS for secure cookies

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review backend and frontend README files
- Open an issue on GitHub

---

**Note**: This is a complete authentication system with production-ready security features. Make sure to properly configure environment variables and use strong secrets in production. 