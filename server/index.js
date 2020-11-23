require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const dbUrl = process.env.MONGODB;
const routes = require('../routes');

const app = express();
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};
mongoose.connect(dbUrl, mongooseOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  // console.log('MongoDB connected!');
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(routes);

module.exports = app;