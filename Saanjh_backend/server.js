require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MONGO_URI = process.env.MONGO_URI;


// Middleware
app.use(bodyParser.json());
app.use(cors());


console.log('MONGO_URI:', process.env.MONGO_URI);

// Ensure MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined. Please add it to your .env file.');
  process.exit(1); // Exit the application if the URI is not defined
}




// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define routes
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
