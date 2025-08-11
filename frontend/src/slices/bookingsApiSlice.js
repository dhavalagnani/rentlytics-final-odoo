import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BOOKINGS_URL } from '../constants';

export const bookingsApiSlice = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include'
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // Queries
    getBookings: builder.query({
      query: () => ({
        url: BOOKINGS_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),
    getMyBookings: builder.query({
      query: () => ({
        url: `${BOOKINGS_URL}/my`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query({
      query: (id) => ({
        url: `${BOOKINGS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),
    getPenaltyStatistics: builder.query({
      query: () => ({
        url: `${BOOKINGS_URL}/penalty-stats`,
      }),
      transformResponse: (response) => {
        console.log('Transformed penalty stats:', response);
        
        // Ensure we always have valid data structure even if response is missing fields
        const transformedResponse = {
          totalPenaltyCount: response?.totalPenaltyCount || 0,
          totalPenaltyAmount: response?.totalPenaltyAmount || 0,
          customerPenalties: response?.customerPenalties || []
        };
        
        return transformedResponse;
      },
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),

    // Mutations
    createBooking: builder.mutation({
      query: (data) => ({
        url: BOOKINGS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking', 'EV'],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status, damageReport, penaltyAmount, penaltyReason }) => {
        // Sanitize ID and ensure proper URL formation
        const sanitizedId = id.trim();
        console.log(`Making status update request to: ${BOOKINGS_URL}/${sanitizedId}/status with status ${status}`);
        
        // Create a body object with only defined values to prevent sending undefined fields
        const body = { status };
        
        // Only add these fields if they are defined
        if (damageReport !== undefined) body.damageReport = damageReport;
        if (penaltyAmount !== undefined) body.penaltyAmount = penaltyAmount;
        if (penaltyReason !== undefined) body.penaltyReason = penaltyReason;
        
        console.log('Request body:', body);
        
        return {
          url: `${BOOKINGS_URL}/${sanitizedId}/status`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `${BOOKINGS_URL}/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking', 'EV'],
    }),
    reportDamage: builder.mutation({
      query: ({ id, damageDescription, penaltyAmount, images }) => ({
        url: `${BOOKINGS_URL}/${id}/damage-report`,
        method: 'POST',
        body: { damageDescription, penaltyAmount, images },
      }),
      invalidatesTags: ['Booking'],
    }),
    updateUserLocation: builder.mutation({
      query: ({ bookingId, location }) => ({
        url: `${BOOKINGS_URL}/${bookingId}/location`,
        method: 'PUT',
        body: { location },
      }),
    }),
    updateBooking: builder.mutation({
      query: ({ bookingId, ...data }) => ({
        url: `${BOOKINGS_URL}/${bookingId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingLocation: builder.mutation({
      query: ({ bookingId, location, penalty }) => ({
        url: `${BOOKINGS_URL}/${bookingId}/location`,
        method: 'PUT',
        body: { location, penalty },
      }),
    }),
    // For testing - add test penalties
    addTestPenalty: builder.mutation({
      query: ({ bookingId, penaltyAmount, reason }) => {
        // Ensure proper URL format
        const sanitizedId = bookingId.trim();
        console.log(`Adding test penalty to booking: ${sanitizedId}`);
        
        return {
          url: `${BOOKINGS_URL}/${sanitizedId}/test-penalty`,
          method: 'POST',
          body: { penaltyAmount, reason },
        };
      },
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useGetPenaltyStatisticsQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
  useReportDamageMutation,
  useUpdateUserLocationMutation,
  useUpdateBookingMutation,
  useUpdateBookingLocationMutation,
  useAddTestPenaltyMutation,
} = bookingsApiSlice; 