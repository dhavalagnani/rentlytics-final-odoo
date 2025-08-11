import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkedAlt, 
  FaCarSide, 
  FaSearch,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useGetMyBookingsQuery } from '../slices/bookingsApiSlice';
import Loader from '../components/Loader';

const MyBookingsScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  const { data: bookings, isLoading, error } = useGetMyBookingsQuery();

  // Filter and sort bookings
  useEffect(() => {
    if (bookings) {
      let filtered = [...bookings];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(booking => 
          booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.evId?.manufacturer && booking.evId.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.evId?.model && booking.evId.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.startStationId?.name && booking.startStationId.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(booking => booking.status === statusFilter);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'status':
            return a.status.localeCompare(b.status);
          case 'amount':
            return (b.totalCost || 0) - (a.totalCost || 0);
          default:
            return 0;
        }
      });

      setFilteredBookings(filtered);
    }
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInHours = (end - start) / (1000 * 60 * 60);
    return Math.ceil(diffInHours);
  };

  const isActiveBooking = (booking) => {
    return ['pending', 'approved'].includes(booking.status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading bookings: {error.message}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Track and manage your electric vehicle rentals</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-600">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No bookings match your filters' : 'No bookings found'}
            </div>
            {searchTerm || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/stations"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Your First EV
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {booking.evId?.manufacturer?.charAt(0) || 'E'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.evId?.manufacturer} {booking.evId?.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.evId?.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 mb-1 flex items-center">
                        <FaCalendarAlt className="mr-1.5 text-blue-500" />
                        {formatDate(booking.startTime)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <FaClock className="mr-1.5 text-gray-400" />
                        {calculateDuration(booking.startTime, booking.endTime)} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.startStationId?.name || 'Unknown Station'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.startStationId?.address || 'No address available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.totalCost || '0'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.evId?.pricePerHour ? `₹${booking.evId.pricePerHour}/hr` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {(booking.penalty || booking.hasPenalty) && (
                        <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Penalty
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActiveBooking(booking) ? (
                        <Link 
                          to={`/ride/${booking._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg inline-flex items-center transition-colors"
                        >
                          {booking.status === 'ongoing' ? (
                            <>
                              <FaMapMarkedAlt className="mr-1.5" />
                              Track Ride
                            </>
                          ) : (
                            <>
                              <FaCarSide className="mr-1.5" />
                              Start Ride
                            </>
                          )}
                        </Link>
                      ) : (
                        <div>
                          {(booking.penalty || booking.hasPenalty) ? (
                            <Link 
                              to={`/bookings/${booking._id}/penalty-receipt`}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md inline-flex items-center"
                            >
                              View Receipt
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {booking.status === 'completed' ? 'Completed' : 
                               booking.status === 'cancelled' ? 'Cancelled' : 
                               'Awaiting approval'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyBookingsScreen; 