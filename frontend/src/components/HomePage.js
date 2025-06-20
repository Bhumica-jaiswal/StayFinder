import React, { useState } from 'react';
import PropertyCard from './PropertyCard';

function HomePage({ properties, onSearch, onPropertySelect }) {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    maxGuests: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <div className="home-page">
      <div className="hero">
        <h2>Find Your Perfect Stay</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search destinations..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <button onClick={() => onSearch(filters)}>Search</button>
        </div>
      </div>
      
      <div className="filters">
        <select 
          value={filters.type} 
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="room">Room</option>
          <option value="villa">Villa</option>
        </select>
        
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Bedrooms"
          value={filters.bedrooms}
          onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
        />
      </div>
      
      <div className="properties-grid">
        {properties.map(property => (
          <PropertyCard 
            key={property._id}
            property={property}
            onClick={() => onPropertySelect(property)}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;