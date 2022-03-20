// You are welcome to drop express for any other server implementation
const express = require('express')
const fs = require("fs")
const uuid = require("uuid")

const server = express()

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
module.exports = server

// We'll store the data in memory - Lol no we won't, already started with fs before noticing this xD
// const storage = {};

if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000
  server.listen((port), () => {
    console.log(`App listening at http://localhost:${port}`)
  })
}

server.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, PUT');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	next();
});

// ROUTES

server.delete('/data/:repository/:objectID', async (req, res) => {
  // validate objectID
  if (!uuid.validate(req.query.objectID)) {
    return res.send(500).json({ message: 'Invalid objectID' })
  }

  await fs.unlink(`./data/${repository}/${objectID}.json`, err => {
    if (err) {
      return res.send(500).json({ message: err.message ? err.message ? 'Failed to Delete JSON File or File Does Not Exist' })
    }
  });

  res.send(200).end()
});

server.get('/data/:repository/:objectID', async (req, res) => {
  // validate objectID
  if (!uuid.validate(req.query.objectID)) {
    return res.send(500).json({ message: 'Invalid objectID' })
  }

  let objectData;

  await fs.readFile(`./data/${repository}/${objectID}.json`, "utf8", (err, jsonString) => {
    if (err) {
      return res.send(500).json({ message: err.message ? err.message ? 'Failed to Read JSON File' })
    }
    objectData = jsonString;
  });

  res.send(200).json(objectData)
});

server.put('/data/:repository', async (req, res) => {
  // validate json
  try {
    JSON.parse(req.body)
  } catch (err) {
    return res.send(500).json({ message: err.message ? err.message : 'Invalid JSON submitted' })
  }
  
  const oid = new uuid();
  let size;

  // check if directory exists
  await fs.access(`./data/${req.query.repository}`, function(err) {
    // create dir if doesnt exist
    err && fs.mkdir(`./data/${req.query.repository}`); 
    
    // store file in repository folder
    await fs.writeFile(`./data/${req.query.repository}/${oid}.json`, JSON.stringify(req.body), 'utf8', function (err) {
      if (err) {
          return res.send(500).json({ message: err.message ? err.message : 'File Could Not Be Written' })
      }
    });
  })


  res.send(201).json({ oid, size })
});