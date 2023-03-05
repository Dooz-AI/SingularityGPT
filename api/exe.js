const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

router.get('/', (req, res) => {
  let db = new sqlite3.Database('./database/conversations.db', (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  if (req.query.Id == undefined) {
    let sql = `SELECT * FROM conversations`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.end(JSON.stringify(rows));
    });

  } else {
    let sql = `SELECT * FROM conversations WHERE Id=(?)`;
    db.all(sql, [req.query.Id], (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.end(JSON.stringify(rows));
    });

  }
});

router.delete('/', (req, res) => {
  let db = new sqlite3.Database('./database/conversations.db', (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  let sql = `DELETE FROM conversations WHERE Id=(?)`;
  db.all(sql, [req.query.Id], (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    res.end("Deleted");
  });


  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });

});

async function asyncExe(req, res) {
  const model = req.query.model;
  const parameters = req.body;
  const exeModule = require(`../models/${model}/exe.js`)

  executionResult = await exeModule.execute(parameters);
  res.end(JSON.stringify(executionResult));

  if (parameters.configuration != undefined) {
    if (parameters.configuration.modelType == "Generator") {

      newestMessage = { role: "assistant", "content": executionResult.choices[0].message.content }
      messagesToInsert = JSON.stringify(parameters.messages.concat(newestMessage))

      let db = new sqlite3.Database('./database/conversations.db', (err) => {
        if (err) {
          console.error(err.message);
        }
      });


      conversationName = parameters.messages[0].content.slice(0, 30)

      let sql = `INSERT OR REPLACE INTO conversations (Id, name, messages) VALUES (?, ?, ?)`;
      db.run(sql, [parameters.conversationID, conversationName, messagesToInsert], function (err) {
        if (err) {
          console.error(err.message);
        }
      });

      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });

    }
  }
}

router.post('/', (req, res) => {
  asyncExe(req, res);
});

module.exports = router;