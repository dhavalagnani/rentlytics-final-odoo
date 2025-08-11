import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';
import paymentService from '../services/paymentService';

const AuthDebug = () => {
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [userData, setUserData] = useState(null);
  const [cookies, setCookies] = useState('');
  const [testResult, setTestResult] = useState('');

  const checkAuth = async () => {
    try {
      setAuthStatus('Checking authentication...');
      console.log('🔍 Debug: Checking authentication...');
      console.log('🔍 Debug: Current cookies:', document.cookie);
      
      const user = await authAPI.getCurrentUser();
      console.log('🔍 Debug: Auth response:', user);
      
      setUserData(user);
      setAuthStatus('Authenticated');
    } catch (error) {
      console.error('🔍 Debug: Auth error:', error);
      setAuthStatus('Not authenticated');
      setUserData(null);
    }
    
    setCookies(document.cookie);
  };

  const testPaymentAuth = async () => {
    try {
      setTestResult('Testing payment authentication...');
      console.log('🧪 Testing payment authentication...');
      
      // Test with minimal order data
      const testOrderData = {
        productId: '507f1f77bcf86cd799439011', // Dummy ID
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        unitCount: 1,
        rentalType: 'daily',
        rentalDuration: 1,
        totalAmount: 100,
        rentalAmount: 100,
        depositAmount: 0
      };
      
      const result = await paymentService.createOrder(testOrderData);
      console.log('🧪 Payment test result:', result);
      setTestResult('Payment authentication successful!');
    } catch (error) {
      console.error('🧪 Payment test error:', error);
      setTestResult(`Payment test failed: ${error.message}`);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="card p-4 mb-4">
      <h3 className="text-white font-semibold mb-2">🔍 Authentication Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-white/80">Status: </span>
          <span className={`font-medium ${authStatus === 'Authenticated' ? 'text-green-400' : 'text-red-400'}`}>
            {authStatus}
          </span>
        </div>
        
        <div>
          <span className="text-white/80">Cookies: </span>
          <span className="text-white font-mono text-xs break-all">
            {cookies || 'No cookies found'}
          </span>
        </div>
        
        {userData && (
          <div>
            <span className="text-white/80">User: </span>
            <span className="text-white">
              {userData.user?.firstName} {userData.user?.lastName} ({userData.user?.email})
            </span>
          </div>
        )}
        
        <div className="flex gap-2 mt-2">
          <button 
            onClick={checkAuth}
            className="btn btn-sm btn-outline"
          >
            Refresh Auth Status
          </button>
          
          <button 
            onClick={testPaymentAuth}
            className="btn btn-sm btn-primary"
            disabled={authStatus !== 'Authenticated'}
          >
            Test Payment Auth
          </button>
        </div>
        
        {testResult && (
          <div className="mt-2 p-2 bg-white/10 rounded text-xs">
            <span className="text-white/80">Test Result: </span>
            <span className="text-white">{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
