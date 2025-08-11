import mongoose from 'mongoose';

const evStationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
    },
    chargingPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    operatingHours: {
      opening: {
        type: String,
        required: true,
        default: '09:00',
      },
      closing: {
        type: String,
        required: true,
        default: '18:00',
      },
    },
    pricing: {
      baseRate: {
        type: Number,
        required: true,
        default: 50, // per hour
      },
      peakRate: {
        type: Number,
        default: 75, // per hour during peak hours
      },
      overnightRate: {
        type: Number,
        default: 30, // per hour during night
      },
    },
    amenities: [String],
    images: [String],
    description: String,
    contactInfo: {
      phone: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the location.coordinates field for geospatial queries
evStationSchema.index({ 'location.coordinates': '2dsphere' });

// Create a text index on name and description for search functionality
evStationSchema.index({ name: 'text', description: 'text' });

const EVStation = mongoose.model('EVStation', evStationSchema);

export default EVStation; 