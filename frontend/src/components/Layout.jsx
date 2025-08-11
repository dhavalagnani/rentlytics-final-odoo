import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import { authAPI } from "../services/apiService";

// Utility function to sanitize props and remove non-DOM attributes
const sanitizeProps = (props) => {
  const { jsx, ...domProps } = props;
  return domProps;
};

function Layout({ children, showSidebar = true, ...props }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.ok) {
        setUser({
          name: response.user.firstName,
          email: response.user.email,
          avatar: "👤",
          role: "Customer",
        });
      }
    } catch (error) {
      console.error("Error checking current user:", error);
    }
  };

  const handleAuthModalOpen = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  // Sanitize props to remove any jsx attributes
  const sanitizedProps = sanitizeProps(props);
  return (
    <div className="min-h-screen flex flex-col bg-surface" {...sanitizedProps}>
      {/* Header - starts from top-left corner */}
      <Navbar
        onLoginClick={handleAuthModalOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - starts immediately under header, flush with left edge */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Footer - spans full width */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default Layout;
