# Pickup & Return Flow Implementation

This document describes the comprehensive Pickup & Return Flow implementation for the rental management system.

## 🎯 Overview

The Pickup & Return Flow provides a complete lifecycle management system for rental bookings, including:

- **Pickup Flow**: Document generation, address storage, stock updates, and notifications
- **Return Flow**: Condition assessment, penalty calculation, document generation, and stock restoration
- **Address Management**: Storage and retrieval of pickup/drop addresses
- **Penalty System**: Configurable damage and late return penalties
- **Stock Management**: Automatic inventory updates during pickup and return
- **WhatsApp Notifications**: Real-time updates to customers

## 📁 File Structure

```
backend/
├── models/
│   ├── Booking.model.js          # Updated with pickup/return fields
│   ├── Product.model.js          # Updated with stock tracking
│   └── Settings.model.js         # New penalty configuration model
├── controllers/
│   ├── booking.controller.js     # Updated with pickup/return methods
│   └── settings.controller.js    # New penalty settings controller
├── routes/
│   ├── bookings.route.js         # Updated with new endpoints
│   └── settings.route.js         # New penalty settings routes
├── services/
│   ├── penaltyService.js         # New penalty calculation service
│   ├── stockService.js           # New stock management service
│   ├── documentService.js        # New document generation service
│   └── notificationService.js    # Updated with WhatsApp notifications
└── test-pickup-return-flow.js    # Comprehensive test suite
```

## 🔄 Booking Status Flow

```
pending → confirmed → reserved → picked_up → returned
    ↓         ↓         ↓          ↓          ↓
  Payment   Payment   Ready for  Items with  Complete
  Pending   Complete   Pickup     Customer    Return
```

## 🚀 API Endpoints

### Booking Management

#### Get Bookings by Stage

```http
GET /api/bookings/stage/:stage
```

**Parameters:**

- `stage`: `reserved`, `picked_up`, or `returned`
- `userId` (optional): Filter by specific user
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "stage": "reserved",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Confirm Pickup

```http
POST /api/bookings/:id/pickup/confirm
```

**Request Body:**

```json
{
  "pickupAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "pickedUpBy": "Pickup Team",
  "notes": "Customer verified ID"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "...",
      "bookingId": "BOOK_001",
      "status": "picked_up",
      "pickupAddress": {...},
      "pickupDocument": {
        "documentId": "PICKUP_ABC123",
        "generatedAt": "2024-01-15T10:30:00Z",
        "documentUrl": "/documents/pickup/PICKUP_ABC123.pdf"
      },
      "pickupDetails": {
        "pickedUpAt": "2024-01-15T10:30:00Z",
        "pickedUpBy": "Pickup Team",
        "notes": "Customer verified ID"
      }
    },
    "pickupDocument": {
      "documentId": "PICKUP_ABC123",
      "documentType": "pickup",
      "customer": {...},
      "product": {...},
      "pickupAddress": {...},
      "rentalDetails": {...},
      "terms": [...]
    }
  }
}
```

#### Confirm Return

```http
POST /api/bookings/:id/return/confirm
```

**Request Body:**

```json
{
  "dropAddress": {
    "street": "456 Return Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400002",
    "country": "India"
  },
  "returnedBy": "Return Team",
  "condition": "good",
  "notes": "Minor scratches on lens",
  "damagePenaltyReason": "Lens scratches",
  "actualReturnDate": "2024-01-22T15:30:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "...",
      "bookingId": "BOOK_001",
      "status": "returned",
      "dropAddress": {...},
      "returnDocument": {
        "documentId": "RETURN_XYZ789",
        "generatedAt": "2024-01-22T15:30:00Z",
        "documentUrl": "/documents/return/RETURN_XYZ789.pdf"
      },
      "returnDetails": {
        "returnedAt": "2024-01-22T15:30:00Z",
        "returnedBy": "Return Team",
        "condition": "good",
        "notes": "Minor scratches on lens"
      },
      "penalties": {
        "damagePenalty": {
          "amount": 100,
          "reason": "Lens scratches",
          "appliedAt": "2024-01-22T15:30:00Z"
        },
        "latePenalty": {
          "amount": 50,
          "daysLate": 2,
          "appliedAt": "2024-01-22T15:30:00Z"
        },
        "totalPenalty": 150
      }
    },
    "returnDocument": {
      "documentId": "RETURN_XYZ789",
      "documentType": "return",
      "customer": {...},
      "product": {...},
      "dropAddress": {...},
      "returnDetails": {...},
      "penalties": {...},
      "rentalSummary": {...}
    }
  }
}
```

### Penalty Settings

#### Get Penalty Settings

```http
GET /api/settings/penalty
```

#### Update Penalty Settings

```http
PUT /api/settings/penalty
```

**Request Body:**

```json
{
  "damagePenaltyRate": 10,
  "damagePenaltyType": "percentage",
  "latePenaltyRate": 5,
  "latePenaltyType": "percentage",
  "maxLatePenaltyDays": 7,
  "notificationSettings": {
    "pickupReminderHours": 2,
    "returnReminderHours": 24
  }
}
```

#### Reset Penalty Settings

```http
POST /api/settings/penalty/reset
```

## 📊 Data Models

### Booking Model Updates

```javascript
// New fields added to Booking model
{
  // Pickup & Return Flow Fields
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dropAddress: {
    // Same structure as pickupAddress
  },
  pickupDocument: {
    documentId: String,
    generatedAt: Date,
    documentUrl: String
  },
  returnDocument: {
    // Same structure as pickupDocument
  },
  penalties: {
    damagePenalty: {
      amount: Number,
      reason: String,
      appliedAt: Date
    },
    latePenalty: {
      amount: Number,
      daysLate: Number,
      appliedAt: Date
    },
    totalPenalty: Number
  },
  pickupDetails: {
    pickedUpAt: Date,
    pickedUpBy: String,
    notes: String
  },
  returnDetails: {
    returnedAt: Date,
    returnedBy: String,
    condition: String, // "excellent", "good", "fair", "damaged"
    notes: String
  }
}
```

### Settings Model

```javascript
{
  damagePenaltyRate: Number,      // Default: 10 (10%)
  damagePenaltyType: String,      // "percentage" or "fixed"
  latePenaltyRate: Number,        // Default: 5 (5% per day)
  latePenaltyType: String,        // "percentage" or "fixed"
  maxLatePenaltyDays: Number,     // Default: 7
  notificationSettings: {
    pickupReminderHours: Number,  // Default: 2
    returnReminderHours: Number   // Default: 24
  }
}
```

### Product Model Updates

```javascript
// New fields added to Product model
{
  unitsAvailable: Number,     // Units available for booking
  unitsWithCustomer: Number,  // Units currently with customers
  totalUnits: Number          // Total units owned
}
```

## 🔧 Services

### Penalty Service (`penaltyService.js`)

- `calculateDamagePenalty(deposit, reason)`: Calculate damage penalty
- `calculateLatePenalty(expectedDate, actualDate, deposit)`: Calculate late penalty
- `calculateTotalPenalty(damagePenalty, latePenalty)`: Calculate total penalties
- `getPenaltySettings()`: Get current penalty configuration

### Stock Service (`stockService.js`)

- `updateStockOnPickup(productId, unitCount)`: Update stock when items picked up
- `updateStockOnReturn(productId, unitCount)`: Update stock when items returned
- `getStockStatus(productId)`: Get current stock status
- `validateStockAvailability(productId, unitCount, startDate, endDate)`: Validate availability

### Document Service (`documentService.js`)

- `generatePickupDocument(booking, pickupAddress)`: Generate pickup document
- `generateReturnDocument(booking, dropAddress, returnDetails)`: Generate return document
- `getDocumentById(documentId)`: Retrieve document details
- `validateDocumentAccess(documentId, userId, booking)`: Validate access permissions

## 📱 WhatsApp Notifications

The system sends automatic WhatsApp notifications for:

1. **Booking Confirmation**: When a booking is created
2. **Pickup Confirmation**: When pickup is confirmed
3. **Return Confirmation**: When return is confirmed (including penalties)

### Notification Messages

#### Pickup Confirmation

```
🎉 Your rental pickup is confirmed!

📦 Item: [Product Name]
📍 Pickup Address: [Address]
📅 Pickup Date: [Date]
📋 Document ID: [Document ID]

Please have your ID ready for verification.
```

#### Return Confirmation

```
✅ Your rental return is confirmed!

📦 Item: [Product Name]
📍 Return Address: [Address]
📅 Return Date: [Date]
📋 Document ID: [Document ID]

💰 Penalties Applied: ₹[Amount]
🔧 Damage Penalty: ₹[Amount]
⏰ Late Penalty: ₹[Amount] ([Days] days)

✅ No penalties applied
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd backend
node test-pickup-return-flow.js
```

The test suite covers:

- Settings model functionality
- Penalty calculations
- Document generation
- Stock management
- Notification service
- Complete booking flow

## 🔄 Workflow Examples

### Complete Pickup Flow

1. **Booking Created**: Status = `reserved`
2. **Pickup Confirmed**:
   - Status → `picked_up`
   - Stock updated (available -2, with customer +2)
   - Pickup document generated
   - WhatsApp notification sent
   - Address stored in booking

### Complete Return Flow

1. **Return Confirmed**:
   - Status → `returned`
   - Stock updated (available +2, with customer -2)
   - Condition assessed
   - Penalties calculated (if applicable)
   - Return document generated
   - WhatsApp notification sent
   - Address stored in booking

## 🛠️ Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```env
# Twilio Configuration (for WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number

# MongoDB
MONGO_URI=your_mongodb_connection_string
```

### Default Penalty Settings

The system comes with sensible defaults:

- Damage Penalty: 10% of deposit
- Late Penalty: 5% per day (max 7 days)
- Notification Reminders: 2 hours before pickup, 24 hours before return

## 🚨 Error Handling

The system includes comprehensive error handling for:

- Invalid booking status transitions
- Insufficient stock for pickup
- Invalid penalty calculations
- Document generation failures
- Notification delivery failures

All errors are logged with detailed information for debugging.

## 📈 Future Enhancements

Potential improvements:

- PDF document generation (currently mock)
- Email notifications
- SMS notifications
- Real-time tracking
- Photo uploads for condition assessment
- Automated penalty processing
- Integration with payment gateways
- Mobile app support
