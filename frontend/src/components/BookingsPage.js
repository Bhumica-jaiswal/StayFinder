import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function BookingsPage({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  return (
    <div className="bookings-page">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-image">
                {booking.property.images.length > 0 ? (
                  <img src={`http://localhost:5000/${booking.property.images[0]}`} alt={booking.property.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="booking-info">
                <h3>{booking.property.title}</h3>
                <p>{booking.property.location.city}</p>
                <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
                <p>Guests: {booking.guests}</p>
                <p>Total: ${booking.totalPrice}</p>
                <span className={`status ${booking.status}`}>{booking.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;