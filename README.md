# 🚗 EV Management System

A comprehensive Electric Vehicle Rental Management System built with MERN stack (MongoDB, Express.js, React, Node.js).

## ✨ Features

- **User Management**: Multi-role system (Customer, Station Master, Admin)
- **Station Management**: EV charging stations with geofencing
- **Vehicle Management**: Electric vehicle tracking and status
- **Booking System**: Real-time booking with photo verification
- **Payment Processing**: Integrated payment system
- **Real-time Tracking**: Live location tracking during rides
- **Penalty System**: Automated penalty management
- **Notification System**: Real-time notifications
- **Geofencing**: Location-based services and validation

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ev-management
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the application**
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run server    # Backend only
npm run client    # Frontend only
```

## 📁 Project Structure

```
ev-management/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── uploads/            # File uploads
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # Page components
│   │   ├── slices/         # Redux slices
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
└── package.json            # Root package configuration
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ev-management
JWT_SECRET=your_super_secret_jwt_key_here
```

### Frontend Configuration
The frontend is configured to connect to the backend API at `/api` endpoints.

## 📱 Available Scripts

- `npm start` - Start backend server
- `npm run server` - Start backend in development mode
- `npm run client` - Start frontend development server
- `npm run dev` - Start both backend and frontend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## 🌐 API Endpoints

### Authentication
- `POST /api/users/auth` - User login
- `POST /api/users` - User registration
- `POST /api/users/logout` - User logout

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id` - Get station by ID
- `GET /api/stations/nearest` - Find nearest stations

### EVs (Electric Vehicles)
- `GET /api/evs` - Get all EVs
- `GET /api/evs/:id` - Get EV by ID
- `POST /api/evs` - Create new EV

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/user` - Get user payments

### Rides
- `POST /api/rides/start` - Start a ride
- `PUT /api/rides/:id/end` - End a ride
- `GET /api/rides/active` - Get active ride

## 🔐 User Roles

### Customer
- Browse stations and EVs
- Make bookings
- Track rides
- View payment history

### Station Master
- Manage station operations
- Handle EV maintenance
- Process returns
- View station analytics

### Admin
- Full system access
- User management
- System configuration
- Analytics and reporting

## 🗄️ Database Models

- **User**: Customer, Station Master, Admin accounts
- **Station**: EV charging stations with geolocation
- **EV**: Electric vehicles with status tracking
- **Booking**: Ride reservations and management
- **Ride**: Active ride tracking and history
- **Payment**: Transaction records
- **Penalty**: Violation and fine management
- **Notification**: System notifications

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `netstat -ano | findstr :5000`

3. **Module Not Found**
   - Run `npm install` in respective directories
   - Check import/export syntax

4. **CORS Errors**
   - Verify CORS configuration in backend
   - Check frontend API base URL

### Development Tips

- Use `npm run dev` for concurrent development
- Check backend logs for API errors
- Use browser dev tools for frontend debugging
- Monitor MongoDB connections

## 📊 Performance Features

- **Geospatial Indexing**: Fast location-based queries
- **Real-time Updates**: WebSocket-like functionality
- **Image Optimization**: Efficient file upload handling
- **Caching**: Redux state management
- **Lazy Loading**: Component-based code splitting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Role-based Access**: Granular permissions
- **Input Validation**: Request sanitization
- **CORS Protection**: Cross-origin security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review API documentation

---

**Built with ❤️ using MERN Stack** 