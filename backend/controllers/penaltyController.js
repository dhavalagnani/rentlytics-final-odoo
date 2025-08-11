import asyncHandler from '../middleware/asyncHandler.js';
import Penalty from '../models/penaltyModel.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';

// Get all penalties for a booking
const getPenaltiesByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.query;
  
  if (!bookingId) {
    res.status(400);
    throw new Error('Booking ID is required');
  }
  
  const penalties = await Penalty.find({ bookingId }).populate('userId', 'name email');
  res.json(penalties);
});

// Get all penalties for a user
const getPenaltiesByUser = asyncHandler(async (req, res) => {
  const penalties = await Penalty.find({ userId: req.user._id })
    .populate('bookingId', 'startTime endTime status')
    .sort({ createdAt: -1 });
  
  res.json(penalties);
});

// Create a new penalty
const createPenalty = asyncHandler(async (req, res) => {
  const { bookingId, userId, type, amount, title, description, details } = req.body;
  
  // Basic validation
  if (!bookingId || !userId || !type || !amount) {
    res.status(400);
    throw new Error('Missing required fields');
  }
  
  // Check if booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Create the penalty
  const penalty = await Penalty.create({
    bookingId,
    userId,
    type,
    amount,
    title: title || type,
    description: description || '',
    details,
    status: 'pending' // Default status
  });
  
  // Update booking with penalty reference
  await Booking.findByIdAndUpdate(
    bookingId,
    { 
      $push: { penalties: penalty._id },
      hasPenalty: true,
      penaltyAmount: (booking.penaltyAmount || 0) + amount
    }
  );
  
  res.status(201).json(penalty);
});

// Update a penalty
const updatePenalty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, paidAmount, paidAt } = req.body;
  
  const penalty = await Penalty.findById(id);
  if (!penalty) {
    res.status(404);
    throw new Error('Penalty not found');
  }
  
  // Update fields
  if (status) penalty.status = status;
  if (paymentStatus) penalty.paymentStatus = paymentStatus;
  if (paidAmount) penalty.paidAmount = paidAmount;
  if (paidAt) penalty.paidAt = paidAt;
  
  const updatedPenalty = await penalty.save();
  res.json(updatedPenalty);
});

// Delete a penalty
const deletePenalty = asyncHandler(async (req, res) => {
  const penalty = await Penalty.findById(req.params.id);
  
  if (!penalty) {
    res.status(404);
    throw new Error('Penalty not found');
  }
  
  // Remove penalty reference from booking
  await Booking.findByIdAndUpdate(
    penalty.bookingId,
    { 
      $pull: { penalties: penalty._id },
      $inc: { penaltyAmount: -penalty.amount }
    }
  );
  
  await Penalty.findByIdAndDelete(req.params.id);
  res.json({ message: 'Penalty deleted successfully' });
});

// Mark penalty as paid
const markPenaltyAsPaid = asyncHandler(async (req, res) => {
  const penalty = await Penalty.findById(req.params.id);
  
  if (!penalty) {
    res.status(404);
    throw new Error('Penalty not found');
  }
  
  penalty.status = 'paid';
  penalty.paymentStatus = 'completed';
  penalty.paidAt = new Date();
  
  const updatedPenalty = await penalty.save();
  res.json(updatedPenalty);
});

export {
  getPenaltiesByBooking,
  getPenaltiesByUser,
  createPenalty,
  updatePenalty,
  deletePenalty,
  markPenaltyAsPaid
}; 