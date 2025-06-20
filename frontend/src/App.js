import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import Header from './components/Header';
import HomePage from './components/HomePage';
import PropertyDetail from './components/PropertyDetail';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BookingsPage from './components/BookingsPage';

const API_BASE_URL = 'http://localhost:5000/api';

// Axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    fetchProperties();
  }, []);

  const fetchProperties = async (filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/properties`, { params: filters });
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setCurrentPage('home');
    } catch (error) {
      alert('Login failed: ' + error.response?.data?.message);
    }
  };

  const handleRegister = async (name, email, password, role) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password, role });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setCurrentPage('home');
    } catch (error) {
      alert('Registration failed: ' + error.response?.data?.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  const handleBooking = async (propertyId, checkIn, checkOut, guests) => {
    try {
      await axios.post(`${API_BASE_URL}/bookings`, {
        propertyId,
        checkIn,
        checkOut,
        guests
      });
      alert('Booking successful!');
    } catch (error) {
      alert('Booking failed: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="app">
      <Header 
        user={user} 
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />
      
      <main className="main-content">
        {currentPage === 'home' && (
          <HomePage 
            properties={properties}
            onSearch={fetchProperties}
            onPropertySelect={(property) => {
              setSelectedProperty(property);
              setCurrentPage('property');
            }}
          />
        )}
        
        {currentPage === 'property' && selectedProperty && (
          <PropertyDetail 
            property={selectedProperty}
            user={user}
            onBooking={handleBooking}
            onBack={() => setCurrentPage('home')}
          />
        )}
        
        {currentPage === 'login' && (
          <LoginForm onLogin={handleLogin} />
        )}
        
        {currentPage === 'register' && (
          <RegisterForm onRegister={handleRegister} />
        )}
        
        {currentPage === 'bookings' && user && (
          <BookingsPage user={user} />
        )}
      </main>
    </div>
  );
}

export default App;