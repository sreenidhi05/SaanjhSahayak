require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');

const port = 5000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Middleware
app.use(bodyParser.json());


app.post('/upload', upload.single('file'), async (req, res) => {
  const pdfBuffer = req.file.path;

  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Extract test results from text - customize this based on your PDF structure
    const results = parseTestResults(text);

    res.json(results);
  } catch (error) {
    res.status(500).send('Error parsing PDF');
  }
});

const parseTestResults = (text) => {
  // Parse text to extract test results
  // Customize this function based on the structure of your PDF reports
  const results = {};
  const lines = text.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split(':');
    if (key && value) {
      results[key.trim()] = value.trim();
    }
  });
  return results;
};


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
