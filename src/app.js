const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

mongoose.connect(config.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});