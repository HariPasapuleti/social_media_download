import React from "react";
import "./Header.css";

const Header = ({ isLoggedIn, onSignOut }) => {
  return (
    <header className="header">
      <h1>YouTube Video Downloader</h1>
      <div className="auth-buttons">
        {isLoggedIn ? (
          <button onClick={onSignOut}>Log out</button>
        ) : (
          <>
            <button>Sign in</button>
            <button>Sign up</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
