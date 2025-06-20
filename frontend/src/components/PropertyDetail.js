import React, { useState } from 'react';

function PropertyDetail({ property, user, onBooking, onBack }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to make a booking');
      return;
    }
    onBooking(property._id, checkIn, checkOut, guests);
  };

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const totalPrice = calculateNights() * property.price;

  return (
    <div className="property-detail">
      <button className="back-button" onClick={onBack}>← Back to Search</button>
      
      <div className="property-header">
        <h1>{property.title}</h1>
        <p className="location">{property.location.address}, {property.location.city}</p>
      </div>
      
      <div className="property-images">
        {property.images.map((image, index) => (
          <img key={index} src={`http://localhost:5000/${image}`} alt={`Property ${index + 1}`} />
        ))}
      </div>
      
      <div className="property-content">
        <div className="property-main">
          <div className="host-info">
            <h3>Hosted by {property.host.name}</h3>
            <p>{property.maxGuests} guests • {property.bedrooms} bedrooms • {property.bathrooms} bathrooms</p>
          </div>
          
          <div className="description">
            <h3>About this place</h3>
            <p>{property.description}</p>
          </div>
          
          <div className="amenities">
            <h3>Amenities</h3>
            <ul>
              {property.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="booking-card">
          <div className="price-header">
            <span className="price">${property.price}</span>
            <span className="period">per night</span>
          </div>
          
          <form onSubmit={handleBookingSubmit} className="booking-form">
            <div className="date-inputs">
              <div>
                <label>Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label>Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                required
              >
                {[...Array(property.maxGuests)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            {calculateNights() > 0 && (
              <div className="price-breakdown">
                <div className="price-line">
                  <span>${property.price} x {calculateNights()} nights</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="total-line">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            )}
            
            <button type="submit" className="book-button">
              {user ? 'Book Now' : 'Login to Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;