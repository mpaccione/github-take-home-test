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
  if (!uuid.validate(req.params.objectID)) {
    return res.status(404).json({ message: `Invalid objectID: ${req.params.objectID}` });
  }

  if (!storage[req.params.repository] || !storage[req.params.repository][req.params.objectID]) {
    return res
        .status(404)
        .json({ message: "JSON File Not Found" });
  } else {
    delete storage[req.params.repository][req.params.objectID]
  }

  res.status(200).end();
});

server.get("/data/:repository/:objectID", (req, res) => {
  // validate objectID 
  if (!uuid.validate(req.params.objectID)) {
    return res.status(404).json({ message: `Invalid objectID: ${req.params.objectID}` });
  }

  // check if it exists
  if (!storage[req.params.repository] || !storage[req.params.repository][req.params.objectID]) {
    return res
        .status(404)
        .json({ message: "JSON File Not Found" });
  }

  res.status(200).json(storage[req.params.repository][req.params.objectID]);
});

server.put("/data/:repository", (req, res) => {
  // validate json
  try {
    JSON.parse(JSON.stringify(req.body));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Invalid JSON submitted" });
  }

  const oid = uuid.v4();
  const size = Buffer.byteLength(JSON.stringify(req.body), 'utf8');

  if (!storage[req.params.repository]) {
    storage[req.params.repository] = {}
  }
  storage[req.params.repository][oid] = req.body

  res.status(201).json({ oid, size });
});



if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
