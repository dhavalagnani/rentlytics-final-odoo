import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaChargingStation, FaCar, FaStar, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StationCard = ({ station, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Station Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(station.status)}`}>
            {station.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{station.name}</h3>
        </div>
      </div>

      {/* Station Info */}
      <div className="p-6">
        {/* Location */}
        <div className="flex items-center mb-3 text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          <span className="text-sm">{station.address}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <FaChargingStation className="mr-2 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Charging Points</p>
              <p className="font-semibold">{station.chargingPoints || 0}</p>
            </div>
          </div>
          <div className="flex items-center">
            <FaCar className="mr-2 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Available EVs</p>
              <p className="font-semibold">{station.availableEVs || 0}</p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center mb-4 text-gray-600">
          <FaClock className="mr-2 text-purple-500" />
          <span className="text-sm">
            {station.operatingHours?.opening || '09:00'} - {station.operatingHours?.closing || '18:00'}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`w-4 h-4 ${
                  star <= (station.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className={`ml-2 font-semibold ${getRatingColor(station.rating || 4.5)}`}>
            {station.rating || 4.5}
          </span>
        </div>

        {/* Action Button */}
        <Link
          to={`/stations/${station._id}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default StationCard;
