import React from "react";
import { Link } from "react-router-dom";

const HomeButton = () => {
  return (
    <Link
      to="/"
      className="home-logo-btn"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1100,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-block',
        textDecoration: 'none',
      }}
      aria-label="Go to Dashboard"
    >
      <span style={{fontSize: 32, lineHeight: 1}}>🏠</span>
    </Link>
  );
};

export default HomeButton;
