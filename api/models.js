const express = require('express');
const router = express.Router();
const fs = require('fs');

// Define routes for user resource
router.get('/', (req, res) => {
  
  const directoryPath = 'models'; // Change this to your desired directory path

  fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.json(`Error reading models directory: ${err}`);
    }

    const folders = files.filter(file => file.isDirectory()).map(file => file.name);
    res.json(folders);
  });
});

router.post('/', (req, res) => {
  // code to create a new user in the database
  res.end("post")
});

module.exports = router;