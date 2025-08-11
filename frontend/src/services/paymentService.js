import api from './apiService.js';

class PaymentService {
  // Create Razorpay order
  async createOrder(orderData) {
    try {
      console.log('📤 Creating order:', orderData);
      
      const response = await api.post('/payment/create-order', orderData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }
      
      console.log('✅ Order created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to create order');
    }
  }

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      console.log('🔍 Verifying payment:', paymentData);
      
      const response = await api.post('/payment/verify', paymentData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment verification failed');
      }
      
      console.log('✅ Payment verified successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Payment verification failed');
    }
  }

  // Get payment status
  async getPaymentStatus(orderId) {
    try {
      console.log('📊 Getting payment status for order:', orderId);
      
      const response = await api.get(`/payment/status/${orderId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get payment status');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to get payment status');
    }
  }

  // Get user orders
  async getUserOrders() {
    try {
      console.log('📋 Getting user orders');
      
      const response = await api.get('/payment/orders');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get orders');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting user orders:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to get orders');
    }
  }

  // Initialize Razorpay payment
  async initializeRazorpayPayment(orderData) {
    try {
      console.log('🚀 Initializing Razorpay payment...');
      
      // Create order on backend
      const orderResponse = await this.createOrder(orderData);
      const { order } = orderResponse;
      
      console.log('💰 Razorpay order created:', order.id);

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay script not loaded. Please refresh the page and try again.');
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Rentlytics',
          description: 'Product Rental Payment',
          order_id: order.id,
          handler: async (response) => {
            try {
              console.log('💳 Payment completed, verifying...', response);
              
              // Verify payment
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              };

              const verificationResponse = await this.verifyPayment(verificationData);
              
              if (verificationResponse.success) {
                console.log('✅ Payment verification successful');
                resolve({
                  success: true,
                  message: 'Payment successful',
                  orderId: orderResponse.orderId,
                  paymentId: response.razorpay_payment_id
                });
              } else {
                reject(new Error(verificationResponse.message || 'Payment verification failed'));
              }
            } catch (error) {
              console.error('❌ Error in payment handler:', error);
              reject(error);
            }
          },
          prefill: {
            name: orderData.userName || '',
            email: orderData.userEmail || '',
            contact: orderData.userPhone || ''
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              console.log('❌ Payment modal dismissed by user');
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        console.log('🎯 Opening Razorpay payment modal');
        
        try {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          console.error('❌ Error opening Razorpay modal:', error);
          reject(new Error('Failed to open payment modal: ' + error.message));
        }
      });
    } catch (error) {
      console.error('❌ Error initializing Razorpay payment:', error);
      throw error;
    }
  }

  // Load Razorpay script
  loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      document.head.appendChild(script);
    });
  }
}

export default new PaymentService();
