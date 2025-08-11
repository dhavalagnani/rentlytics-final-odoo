import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { authAPI } from "../services/apiService";

// Utility function to sanitize props and remove non-DOM attributes
const sanitizeProps = (props) => {
  const { jsx, ...domProps } = props;
  return domProps;
};

function Layout({ children, showSidebar = true, showFooter = true, ...props }) {
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
    <div className={`${showSidebar ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col bg-surface`} {...sanitizedProps}>
      {/* Header - fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-surface-elev border-b border-border/60">
        <Navbar
          user={user}
          onLogout={handleLogout}
        />
      </header>

      {/* Main content area - takes remaining height */}
      <div className={`flex flex-1 pt-16 ${showSidebar ? 'h-full' : ''}`}>
        {/* Sidebar - fixed position */}
        {showSidebar && (
          <aside className="w-64 bg-surface-elev border-r border-border/60 h-full fixed left-0 top-16 z-10">
            <Sidebar />
          </aside>
        )}

        {/* Main content - scrollable with footer at bottom */}
        <main className={`flex-1 ${showSidebar ? 'overflow-auto ml-64 h-full' : 'overflow-visible'} ${!showSidebar ? 'w-full' : ''}`}>
          <div className={`${showSidebar ? 'min-h-full flex flex-col' : 'w-full'}`}>
            <div className={`${showSidebar ? 'flex-1' : ''} ${showFooter ? 'p-4 sm:p-6 lg:p-8' : 'p-4 sm:p-6 lg:p-8'}`}>
              {React.cloneElement(children, { user })}
            </div>
            
            {/* Footer - only appears at bottom of content, overlaps sidebar */}
            {showFooter && (
              <div className={`${showSidebar ? 'mt-auto -ml-64 pl-64' : 'mt-auto'}`}>
                <Footer />
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

export default Layout;
