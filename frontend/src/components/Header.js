import React from 'react';

function Header({ user, onLogout, onNavigate, currentPage }) {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo" onClick={() => onNavigate('home')}>
          StayFinder
        </h1>
        
        <nav className="nav">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <button onClick={() => onNavigate('bookings')}>My Bookings</button>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('login')}>Login</button>
              <button onClick={() => onNavigate('register')}>Register</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;