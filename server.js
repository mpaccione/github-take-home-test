// You are welcome to drop express for any other server implementation
const express = require("express");
const uuid = require("uuid");

const server = express();

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
module.exports = server;

// We'll store the data in memory
const storage = {};

server.use(express.json())

server.use((req, res, next) => {
	res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, PUT',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json'
  });

	next();
});

// ROUTES

server.get("/ping", (req, res) => {
  res.status(200).json({ message: 'pong' })
})

server.delete("/data/:repository/:objectID", (req, res) => {
  // validate objectID
  if (!uuid.validate(req.query.objectID)) {
    return res.status(500).json({ message: "Invalid objectID" });
  }

  if (!storage[req.query.repository] || !storage[req.query.respository][req.query.objectId]) {
    return res
        .status(404)
        .json({ message: err.message ? err.message : "JSON File Note Found" });
  } else {
    delete storage[req.query.repository][req.query.objectId]
  }

  res.status(200).end();
});

server.get("/data/:repository/:objectID", (req, res) => {
  // validate objectID
  if (!uuid.validate(req.query.objectID)) {
    return res.status(500).json({ message: "Invalid objectID" });
  }

  // check if it exists
  if (!storage[req.query.repository] || !storage[req.query.respository][req.query.objectId]) {
    return res
        .status(404)
        .json({ message: err.message ? err.message : "JSON File Note Found" });
  }

  res.status(200).json(storage[req.query.repository][req.query.objectID]);
});

server.put("/data/:repository", (req, res) => {
  // validate json
  try {
    JSON.parse(req.body);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message ? err.message : "Invalid JSON submitted" });
  }

  const oid = new uuid();
  const size = Buffer.byteLength(JSON.stringify(req.body), 'utf8');

  storage[req.query.repository][oid] = JSON.stringify(req.body)

  res.status(201).json({ oid, size });
});



if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
