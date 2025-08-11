import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyAadhar,
  createStationMaster,
  getStationMasters,
  getAllUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Root GET route for /api/users
router.get('/', (req, res) => {
  res.json({ 
    message: 'Users API endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

router.post('/', registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.post('/verify-aadhar', protect, verifyAadhar);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin Routes
router.route('/admin/create-station-master').post(protect, admin, createStationMaster);
router.route('/admin/station-masters').get(protect, admin, getStationMasters);
router.route('/admin/users').get(protect, admin, getAllUsers);

export default router;
