require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);
console.log("DB Connected...")

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model('User', UserSchema);

// CSV Data Schema
const CsvDataSchema = new mongoose.Schema({
  date: String,
  title: String,
  url: String,
});
const CsvData = mongoose.model('CsvData', CsvDataSchema);

// Middleware for verifying JWT token
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    console.log("No token found in request.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Invalid token:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};


// User Registration
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.json({ message: 'User registered' });
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// File Upload (CSV)
const upload = multer({ dest: 'uploads/' });
app.post('/upload', authenticate, upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      await CsvData.insertMany(results);
      fs.unlinkSync(req.file.path);
      res.json({ message: 'CSV uploaded successfully' });
    });
});

// Fetch CSV Data
app.get('/data', authenticate, async (req, res) => {
  const data = await CsvData.find();
  res.json(data);
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
