import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Handle swipe gesture
  useEffect(() => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (e.touches[0].clientX < 50) { // Only start swipe from left edge
        startX = e.touches[0].clientX;
        isDragging = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      
      if (currentX - startX > 50 && !isOpen) {
        setIsOpen(true);
        isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen]);

  // Apply body class for content shifting
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  const navigationItems = [
    {
      icon: '🏠',
      text: 'Dashboard',
      path: '/',
    },
    {
      icon: '⚙️',
      text: 'Settings',
      path: '/settings',
    },
    {
      icon: '🍅',
      text: 'Pomodoro',
      path: '/pomodoro',
      badge: 'New'
    },
    {
      icon: '💭',
      text: 'Quote of the Day',
      path: '/quote-of-the-day',
    },
    {
      icon: '📊',
      text: 'Analytics',
      path: '/analytics',
      badge: 'Soon'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">Habitualize</div>
          <div className="sidebar-subtitle">Track • Build • Achieve</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`sidebar-nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={e => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-text">{item.text}</span>
              {item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">H</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Habit Builder</div>
              <div className="sidebar-user-status">Building habits daily</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
