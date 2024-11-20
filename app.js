require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const morgan = require('morgan');
const cors = require('cors'); // Import CORS
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors()); // Enable CORS - Add this line here
app.use(express.json());
app.use(morgan('combined')); // Logs HTTP requests in the "combined" format

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/assignments', require('./routes/assignments'));

// Error Handling Middleware
app.use(errorHandler); // Add this after all routes

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
