const express = require('express');
const router = express.Router();
const fs = require('fs');

// Define routes for user resource
router.get('/', (req, res) => {
  models = req.query.models;
  splitModels = models.split(",");

  modelConfigurations = [];
  
  for(i=0;i<splitModels.length;i++){
    //read contents of config files for models
    modelName = splitModels[i];
    filePath = 'models/'+modelName+"/conf.json";

    try {
      data = fs.readFileSync(filePath, 'utf8');
      parsedConfigFile = JSON.parse(data);
      
      modelConfiguration = {
        modelName: modelName,
        configuration: parsedConfigFile.Configuration
      }
      modelConfigurations.push(modelConfiguration);
    } catch (err) {
      if (err) {
        modelConfigurations.push(`Error reading config file for ${modelName} model: ${err}`);
      }
    }
    
  }
  res.json(modelConfigurations);
});

router.post('/', (req, res) => {
  // code to create a new user in the database
  res.end("post")
});

module.exports = router;