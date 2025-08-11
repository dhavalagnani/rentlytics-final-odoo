# Authentication Frontend

A React-based frontend for the authentication system with OTP validation, built with Vite and Tailwind CSS.

## Features

- User registration with email verification via OTP
- Secure login with JWT tokens
- OTP validation with countdown timer
- Responsive design with Tailwind CSS
- Toast notifications for user feedback
- Protected routes and authentication state management

## Prerequisites

- Node.js (v16 or higher)
- Backend server running (see backend README)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

### 1. Sign Up Process
1. User fills out signup form with all required fields:
   - First Name
   - Last Name
   - Email
   - Phone Number (10 digits)
   - Password (minimum 6 characters)
   - Confirm Password
   - Aadhar Number (12 digits)

2. Form validation occurs on both client and server side
3. On successful signup, OTP is sent to user's email
4. User is redirected to OTP validation page

### 2. OTP Validation
1. User enters 6-digit OTP received via email
2. 10-minute countdown timer shows remaining time
3. After successful validation, user account is activated
4. JWT token is set in HTTP-only cookie
5. User is redirected to dashboard

### 3. Login Process
1. User enters email and password
2. On successful login, JWT token is set in HTTP-only cookie
3. User is redirected to dashboard

### 4. User State Management
- User information is stored in React Context
- Authentication state persists across page refreshes
- User's first name is displayed in header when logged in

## API Integration

The frontend communicates with the backend API using axios with the following configuration:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Key Points:
- `withCredentials: true` is essential for sending/receiving HTTP-only cookies
- JWT tokens are automatically handled by the browser
- No manual token management required in frontend code

## Components

### Authentication Components
- `SignupForm` - Complete signup form with validation
- `LoginForm` - Login form with email/password
- `ValidateOtp` - OTP validation with countdown timer
- `AuthContext` - React context for user state management

### Layout Components
- `Navbar` - Updated to show user information when logged in
- `Layout` - Main layout wrapper
- `Sidebar` - Navigation sidebar for authenticated users

## Security Features

### Client-Side Validation
- Email format validation
- Password strength requirements
- Phone number format (10 digits)
- Aadhar number format (12 digits)
- Password confirmation matching

### Cookie Security
- JWT tokens stored in HTTP-only cookies
- Secure in production (HTTPS required)
- SameSite: 'lax' for CSRF protection
- 7-day expiration

### Error Handling
- Comprehensive error messages
- Toast notifications for user feedback
- Form validation with inline errors
- Network error handling

## Environment Configuration

The frontend connects to the backend at `http://localhost:5000` by default. To change this:

1. Update the `API_BASE_URL` in `src/services/authService.js`
2. Ensure CORS is properly configured on the backend

## Usage Examples

### Sign Up
```javascript
import { useAuth } from '../context/AuthContext';

const { signup } = useAuth();

const handleSignup = async (userData) => {
  try {
    const response = await signup(userData);
    if (response.ok) {
      // Redirect to OTP validation
      navigate('/validate-otp');
    }
  } catch (error) {
    // Handle error
  }
};
```

### Login
```javascript
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();

const handleLogin = async (credentials) => {
  try {
    const response = await login(credentials);
    if (response.ok) {
      // Redirect to dashboard
      navigate('/dashboard');
    }
  } catch (error) {
    // Handle error
  }
};
```

### Check Authentication Status
```javascript
import { useAuth } from '../context/AuthContext';

const { user, isAuthenticated, loading } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}

if (isAuthenticated) {
  return <div>Welcome, {user.firstName}!</div>;
}
```

## Styling

The application uses Tailwind CSS for styling with a custom design system:

- Primary colors: Indigo theme
- Responsive design for mobile and desktop
- Clean, modern UI with proper spacing
- Form validation styling with error states
- Loading states and disabled button styles

## Development Notes

### State Management
- React Context for authentication state
- Local state for form data and validation
- SessionStorage for OTP ID persistence

### Error Handling
- Try-catch blocks for API calls
- Toast notifications for user feedback
- Form validation with real-time error clearing

### Performance
- Lazy loading of components
- Optimized re-renders with proper dependency arrays
- Efficient form validation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for `http://localhost:5173`
2. **Cookie Issues**: Verify `withCredentials: true` is set in axios config
3. **OTP Not Received**: Check email spam folder and SMTP configuration
4. **Authentication State Lost**: Verify AuthProvider wraps the entire app

### Debug Mode
Enable console logging by checking the browser's developer tools for:
- API request/response logs
- Authentication state changes
- Error messages and stack traces

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your web server
3. Update API base URL for production
4. Ensure HTTPS is enabled for secure cookies
5. Configure proper CORS origins on backend
