require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Models
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.options('*', cors());app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stayfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
app.get('/', (req, res) => {
  res.send('StayFinder backend is running!');
});

// =====================================================
// AUTH ROUTES
// =====================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =====================================================
// PROPERTY ROUTES
// =====================================================

// Get all properties (with search and filters)
app.get('/api/properties', async (req, res) => {
  try {
    const { 
      search, 
      city, 
      type, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      maxGuests,
      page = 1,
      limit = 10 
    } = req.query;

    let query = { available: true };

    // Build search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (type) query.type = type;
    if (minPrice) query.price = { ...query.price, $gte: parseInt(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseInt(maxPrice) };
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (maxGuests) query.maxGuests = { $gte: parseInt(maxGuests) };

    const properties = await Property.find(query)
      .populate('host', 'name email avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name email avatar')
      .populate('ratings.user', 'name avatar');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create property (host only)
app.post('/api/properties', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      address,
      city,
      state,
      country,
      price,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities
    } = req.body;

    const images = req.files ? req.files.map(file => file.path) : [];

    const property = new Property({
      title,
      description,
      type,
      location: { address, city, state, country },
      price: parseFloat(price),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      maxGuests: parseInt(maxGuests),
      amenities: JSON.parse(amenities || '[]'),
      images,
      host: req.user.userId
    });

    await property.save();
    await property.populate('host', 'name email avatar');

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =====================================================
// BOOKING ROUTES
// =====================================================

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate total price (simple calculation)
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;

    const booking = new Booking({
      property: propertyId,
      user: req.user.userId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: parseInt(guests),
      totalPrice
    });

    await booking.save();
    await booking.populate('property', 'title images location');

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate('property', 'title images location price')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});