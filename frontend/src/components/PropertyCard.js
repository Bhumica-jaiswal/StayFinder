import React from 'react';

function PropertyCard({ property, onClick }) {
  const averageRating = property.ratings.length > 0 
    ? property.ratings.reduce((sum, rating) => sum + rating.rating, 0) / property.ratings.length 
    : 0;

  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-image">
        {property.images.length > 0 ? (
          <img src={`http://localhost:5000/${property.images[0]}`} alt={property.title} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      
      <div className="property-info">
        <h3>{property.title}</h3>
        <p className="location">{property.location.city}, {property.location.country}</p>
        <p className="price">${property.price}/night</p>
        <div className="property-details">
          <span>{property.bedrooms} bed • {property.bathrooms} bath • {property.maxGuests} guests</span>
        </div>
        {averageRating > 0 && (
          <div className="rating">
            ⭐ {averageRating.toFixed(1)} ({property.ratings.length} reviews)
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyCard;