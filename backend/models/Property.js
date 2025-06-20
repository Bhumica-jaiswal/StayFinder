const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  price: { type: Number, required: true },
  bedrooms: Number,
  bathrooms: Number,
  maxGuests: Number,
  amenities: [String],
  images: [String],
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);