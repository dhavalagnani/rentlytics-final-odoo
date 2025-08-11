import React from 'react';
import { FaTimes, FaShieldAlt, FaLock, FaEye, FaDatabase, FaUserCheck } from 'react-icons/fa';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaShieldAlt className="text-blue-600 text-xl mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaEye className="text-blue-500 mr-2" />
                Information We Collect
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create an account or profile</li>
                  <li>Make a booking for an electric vehicle</li>
                  <li>Contact our customer support</li>
                  <li>Use our mobile application</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="mt-4">
                  This information may include your name, email address, phone number, 
                  driver's license information, payment details, and location data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaDatabase className="text-green-500 mr-2" />
                How We Use Your Information
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your bookings and payments</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Detect, investigate, and prevent fraudulent transactions</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaLock className="text-red-500 mr-2" />
                Information Sharing
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who assist in our operations</li>
                </ul>
                <p className="mt-4">
                  All third-party service providers are contractually obligated to maintain 
                  the confidentiality and security of your information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUserCheck className="text-purple-500 mr-2" />
                Your Rights and Choices
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@evmanagement.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  We implement appropriate technical and organizational security measures 
                  to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction.
                </p>
                <p>
                  These measures include encryption, secure servers, regular security 
                  assessments, and employee training on data protection.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  We retain your personal information for as long as necessary to 
                  provide our services and comply with legal obligations.
                </p>
                <p>
                  When we no longer need your information, we will securely delete 
                  or anonymize it in accordance with our data retention policies.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  If you have any questions about this Privacy Policy or our data 
                  practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@evmanagement.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 EV Street, Tech City, TC 12345</p>
                </div>
              </div>
            </section>
        </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal; 