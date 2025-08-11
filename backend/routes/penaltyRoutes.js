import express from 'express';
import { 
  getPenaltiesByBooking,
  getPenaltiesByUser,
  createPenalty,
  updatePenalty,
  deletePenalty,
  markPenaltyAsPaid
} from '../controllers/penaltyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get penalties for a booking
router.get('/', protect, getPenaltiesByBooking);

// Get penalties for a user
router.get('/user', protect, getPenaltiesByUser);

// Create a new penalty (restricted to admins and the system)
router.post('/', protect, admin, createPenalty);

// Update penalty status (admin only)
router.patch('/:id', protect, admin, updatePenalty);

// Delete a penalty (admin only)
router.delete('/:id', protect, admin, deletePenalty);

// Mark penalty as paid
router.post('/:id/pay', protect, markPenaltyAsPaid);

export default router; 