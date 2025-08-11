import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaPrint, FaTimesCircle, FaUser, FaCarAlt, FaChartBar, FaDatabase, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  useGetBookingsQuery, 
  useAddTestPenaltyMutation,
  useGetPenaltyStatisticsQuery
} from '../slices/bookingsApiSlice';
import { BOOKINGS_URL } from '../constants';
import Loader from '../components/Loader';

const PenaltyDashboardScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState(100);
  const [penaltyReason, setPenaltyReason] = useState('Test penalty');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'statistics'
  
  const { data: bookings, isLoading, refetch } = useGetBookingsQuery();
  const { data: penaltyStats, isLoading: isLoadingStats } = useGetPenaltyStatisticsQuery();
  const [addTestPenalty, { isLoading: isAddingPenalty }] = useAddTestPenaltyMutation();
  
  // Filter bookings based on search term
  useEffect(() => {
    if (bookings) {
      if (!searchTerm) {
        setFilteredBookings(bookings);
      } else {
        const filtered = bookings.filter(booking => 
          booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.customerId?.name && booking.customerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.evId?.registrationNumber && booking.evId.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredBookings(filtered);
      }
    }
  }, [bookings, searchTerm]);
  
  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setShowAddPenaltyModal(true);
  };
  
  const handleAddPenalty = async () => {
    if (!selectedBooking) return;
    
    try {
      console.log('Sending penalty to:', `${BOOKINGS_URL}/${selectedBooking._id}/test-penalty`);
      await addTestPenalty({
        bookingId: selectedBooking._id,
        penaltyAmount: Number(penaltyAmount),
        reason: penaltyReason
      }).unwrap();
      
      toast.success(`Test penalty added to booking #${selectedBooking._id}`);
      setShowAddPenaltyModal(false);
      refetch();
    } catch (err) {
      console.error('Penalty API error:', err);
      toast.error(err?.data?.message || `Failed to add test penalty: ${err.message || 'Unknown error'}`);
    }
  };
  
  const closeModal = () => {
    setShowAddPenaltyModal(false);
    setSelectedBooking(null);
  };
  
  const renderPenaltyBadge = (booking) => {
    if (!booking.penalty && !booking.hasPenalty) return null;
    
    const amount = booking.penalty?.amount || booking.penaltyAmount;
    
    return (
      <span className="text-accent-red font-medium">
        ₹{amount}
      </span>
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Penalty Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaDatabase className="inline mr-2" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'statistics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaChartBar className="inline mr-2" />
            Statistics
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by ID, customer name, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content Tabs */}
      {activeTab === 'bookings' ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-2">Booking ID</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Vehicle</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Penalty</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader />
            </div>
          ) : filteredBookings && filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="font-mono text-sm text-gray-600">
                        #{booking._id.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium">
                          {booking.customerId?.name || 'Unknown Customer'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <FaCarAlt className="text-gray-400" />
                        <span className="font-medium">
                          {booking.evId?.registrationNumber || 'Unknown Vehicle'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="col-span-2">
                      {renderPenaltyBadge(booking)}
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        onClick={() => handleBookingSelect(booking)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Add Penalty"
                      >
                        <FaPlusCircle />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No bookings found
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Penalty Statistics</h2>
          {isLoadingStats ? (
            <div className="text-center">
              <Loader />
            </div>
          ) : penaltyStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {penaltyStats.totalPenaltyCount || 0}
                </div>
                <div className="text-sm text-blue-600">Total Penalties</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{penaltyStats.totalPenaltyAmount || 0}
                </div>
                <div className="text-sm text-green-600">Total Amount</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {penaltyStats.customerPenalties?.length || 0}
                </div>
                <div className="text-sm text-purple-600">Customers with Penalties</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No penalty statistics available
            </div>
          )}
        </div>
      )}

      {/* Add Penalty Modal */}
      {showAddPenaltyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Test Penalty</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty Amount (₹)
                </label>
                <input
                  type="number"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPenalty}
                  disabled={isAddingPenalty}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAddingPenalty ? 'Adding...' : 'Add Penalty'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PenaltyDashboardScreen; 