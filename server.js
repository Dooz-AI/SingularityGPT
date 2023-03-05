require("dotenv").config();
const bodyParser = require('body-parser');
const express = require('express');
const sqlite3 = require('sqlite3')
const app = express();
const port = 3000;

// Use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw({inflate:true, type: () => true, limit: '10mb' }));

// Serve static files in the frontend directory
app.use(express.static('frontend'));

// Serve static style files and libraries from the node_modules directory
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jscookie', express.static(__dirname + '/node_modules/js-cookie/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/config/config.html');
});
app.get('/config/', (req, res) => {
  res.sendFile(__dirname + '/frontend/config/config.html');
});
app.get('/chat/', (req, res) => {
  res.sendFile(__dirname + '/frontend/chat/chat.html');
});

// Define routes for API
const modelsRoutes = require('./api/models.js');
const confRoutes = require('./api/conf.js');
const exeRoutes = require('./api/exe.js');

app.use('/api/models', modelsRoutes);
app.use('/api/conf', confRoutes);
app.use('/api/exe', exeRoutes);

// Start the Database
let db = new sqlite3.Database('./database/conversations.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});
db.run(`CREATE TABLE IF NOT EXISTS conversations (
  Id TEXT PRIMARY KEY,
  name TEXT,
  messages TEXT
)`, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conversations table created or already exists.');
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});