# Pickup & Return Flow Implementation

## Overview

This document outlines the comprehensive implementation of the Pickup & Return flow for the rental management system, following clean coding standards and modular architecture.

## 🚀 Implemented Features

### 1. Pickup Flow

- **Pickup Confirmation**: `POST /bookings/:id/pickup/confirm`
  - Validates booking status (reserved/confirmed)
  - Updates stock status to "with customer"
  - Generates pickup document with customer and product details
  - Sends notifications to customer and pickup team
  - Updates booking status to "picked_up"

### 2. Return Flow

- **Return Confirmation**: `POST /bookings/:id/return/confirm`
  - Validates booking status (picked_up)
  - Updates stock status to "available"
  - Calculates damage and late penalties
  - Generates return document with penalty details
  - Sends notifications to customer and return team
  - Updates booking status to "returned"

### 3. Address Management

- **Pickup Address**: Stored in booking with coordinates
- **Drop Address**: Stored in booking with coordinates
- **Address Validation**: Ensures street and city are provided

### 4. My Bookings View

- **API Endpoint**: `GET /bookings/my`
  - Fetches user's bookings with statuses: reserved, picked_up, returned, cancelled
  - Includes pickup/drop addresses in response
  - Groups bookings by status for frontend display
  - Provides booking statistics

### 5. Penalty System

- **Damage Penalty**: Based on condition (excellent, good, fair, damaged)
- **Late Penalty**: Calculated per day with maximum cap
- **Configurable Rates**: Percentage or fixed amounts
- **Settings Management**: Admin API to update penalty configurations

## 📁 New/Updated Files

### Services

1. **`services/penaltyService.js`**

   - `calculateDamagePenalty()` - Calculates damage penalties based on condition
   - `calculateLatePenalty()` - Calculates late return penalties
   - `calculateTotalPenalty()` - Combines damage and late penalties
   - `getPenaltySettings()` - Retrieves current penalty settings
   - `updatePenaltySettings()` - Updates penalty configurations

2. **`services/stockService.js`**

   - `markProductAsWithCustomer()` - Updates stock when items picked up
   - `markProductAsAvailable()` - Updates stock when items returned
   - `isProductAvailable()` - Checks product availability
   - `getProductStockInfo()` - Gets detailed stock information
   - `reserveProductStock()` - Reserves stock for booking
   - `releaseReservedStock()` - Releases reserved stock
   - `getStockStatistics()` - Gets overall stock statistics

3. **`services/documentService.js`**

   - `generatePickupDocument()` - Creates pickup documents
   - `generateReturnDocument()` - Creates return documents
   - `generateInvoiceDocument()` - Creates invoice documents
   - `getDocumentById()` - Retrieves documents by ID
   - `generateDocumentSummary()` - Creates document summaries

4. **`services/notificationService.js`**
   - `sendPickupNotification()` - Notifies customer of pickup confirmation
   - `sendReturnNotification()` - Notifies customer of return confirmation
   - `sendPickupTeamNotification()` - Notifies pickup team
   - `sendReturnTeamNotification()` - Notifies return team
   - `sendPenaltyNotification()` - Notifies customer of penalties
   - `sendRefundNotification()` - Notifies customer of refunds
   - `sendPickupReminder()` - Sends pickup reminders
   - `sendReturnReminder()` - Sends return reminders

### Controllers

1. **`controllers/booking.controller.js`** (Updated)

   - `confirmPickup()` - Handles pickup confirmation
   - `confirmReturn()` - Handles return confirmation
   - `getMyBookings()` - Gets user's bookings with addresses

2. **`controllers/settings.controller.js`** (Updated)
   - `getSettings()` - Gets all system settings
   - `getPenaltySettings()` - Gets penalty configurations
   - `updatePenaltySettings()` - Updates penalty settings
   - `updateNotificationSettings()` - Updates notification settings
   - `resetSettings()` - Resets settings to defaults
   - `getSettingsStats()` - Gets settings statistics

### Routes

1. **`routes/bookings.route.js`** (Updated)

   - `GET /bookings/my` - My Bookings endpoint
   - `POST /bookings/:id/pickup/confirm` - Pickup confirmation
   - `POST /bookings/:id/return/confirm` - Return confirmation

2. **`routes/settings.route.js`** (Updated)
   - `GET /settings` - Get all settings
   - `GET /settings/stats` - Get settings statistics
   - `GET /settings/penalty` - Get penalty settings
   - `PUT /settings/penalty` - Update penalty settings
   - `PUT /settings/notifications` - Update notification settings
   - `POST /settings/reset` - Reset settings to defaults

### Models

1. **`models/Booking.model.js`** (Already had pickup/return fields)

   - `pickupAddress` - Pickup location details
   - `dropAddress` - Return location details
   - `pickupDocument` - Generated pickup document info
   - `returnDocument` - Generated return document info
   - `penalties` - Damage and late penalty details
   - `pickupDetails` - Pickup confirmation details
   - `returnDetails` - Return confirmation details

2. **`models/Settings.model.js`** (Already had penalty configurations)
   - `damagePenaltyRate` - Damage penalty percentage/fixed amount
   - `latePenaltyRate` - Late penalty percentage/fixed amount
   - `damagePenaltyType` - Percentage or fixed
   - `latePenaltyType` - Percentage or fixed
   - `maxLatePenaltyDays` - Maximum days for late penalty
   - `notificationSettings` - Reminder timing configurations

## 🔧 API Endpoints

### Pickup & Return Flow

```
POST /api/bookings/:id/pickup/confirm
POST /api/bookings/:id/return/confirm
GET /api/bookings/my
```

### Settings Management

```
GET /api/settings
GET /api/settings/stats
GET /api/settings/penalty
PUT /api/settings/penalty
PUT /api/settings/notifications
POST /api/settings/reset
```

## 🧪 Testing

### Test Scripts

1. **`test-integration.js`** - Comprehensive integration tests
2. **`test-pickup-return-flow.js`** - Specific pickup/return flow tests

### Test Coverage

- Health checks and database connectivity
- User authentication
- Product creation and management
- Booking creation and management
- Pickup confirmation workflow
- Return confirmation workflow
- Penalty calculations
- Document generation
- Notification sending
- Stock management
- Settings management

## 🔄 Workflow Process

### Pickup Process

1. Customer books item → Status: "reserved"
2. Admin confirms pickup → Status: "picked_up"
   - Updates stock to "with customer"
   - Generates pickup document
   - Sends notifications
   - Stores pickup address

### Return Process

1. Customer returns item → Status: "returned"
   - Updates stock to "available"
   - Calculates penalties (damage/late)
   - Generates return document
   - Sends notifications
   - Stores return address

### Penalty Calculation

1. **Damage Penalty**: Based on condition
   - Excellent/Good: No penalty
   - Fair: 50% of standard penalty
   - Damaged: Full penalty
2. **Late Penalty**: Based on days late
   - Capped at maximum configured days
   - Percentage or fixed amount

## 📊 Features Summary

✅ **Pickup Flow**: Complete with document generation and notifications
✅ **Return Flow**: Complete with penalty calculation and notifications
✅ **Address Management**: Pickup and drop addresses stored
✅ **My Bookings View**: API for frontend integration
✅ **Penalty System**: Configurable damage and late penalties
✅ **Stock Management**: Automatic stock updates
✅ **Document Generation**: Pickup and return documents
✅ **Notification System**: Customer and team notifications
✅ **Settings Management**: Admin API for configurations
✅ **Testing**: Comprehensive test coverage

## 🚀 Next Steps

1. **Frontend Integration**: Connect with `schedule.jsx` and "My Bookings" pages
2. **Payment Integration**: Connect penalty deductions with payment system
3. **Document Storage**: Implement actual PDF generation and cloud storage
4. **Real Notifications**: Integrate with actual SMS/email services
5. **Analytics**: Add booking flow analytics and reporting

## 🔧 Configuration

### Default Settings

- Damage Penalty Rate: 10% (percentage)
- Late Penalty Rate: 5% per day (percentage)
- Max Late Penalty Days: 7 days
- Pickup Reminder: 2 hours before
- Return Reminder: 24 hours before

### Environment Variables

- `MONGODB_URI`: Database connection
- `JWT_SECRET`: Authentication secret
- `PORT`: Server port (default: 5000)

## 📝 Notes

- All services follow clean coding standards with proper error handling
- Modular architecture allows easy testing and maintenance
- Mock notification service is wired for testing
- Document generation creates mock URLs (ready for PDF integration)
- Stock management handles quantity tracking and status updates
- Penalty system is fully configurable through admin API
- All endpoints include proper authentication and validation
