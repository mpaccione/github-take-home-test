// You are welcome to drop express for any other server implementation
const express = require("express");
const fs = require("fs");
const uuid = require("uuid");

const server = express();

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
// module.exports = server;

// We'll store the data in memory - Lol no we won't, already started with fs before noticing this xD
// const storage = {};

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
  res.sendStatus(200).json({ message: 'pong' })
})

server.delete("/data/:repository/:objectID", (req, res) => {
  // validate objectID
  if (!uuid.validate(req.query.objectID)) {
    return res.sendStatus(500).json({ message: "Invalid objectID" });
  }

  fs.unlinkSync(`./data/${repository}/${objectID}.json`, (err) => {
    if (err) {
      return res
        .sendStatus(404)
        .json({ message: err.message ? err.message : "JSON File Note Found" });
    }
  });

  res.sendStatus(200).end();
});

server.get("/data/:repository/:objectID", (req, res) => {
  // validate objectID
  if (!uuid.validate(req.query.objectID)) {
    return res.sendStatus(500).json({ message: "Invalid objectID" });
  }

  let objectData;

  fs.readFileSync(
    `./data/${repository}/${objectID}.json`,
    "utf8",
    (err, jsonString) => {
      if (err) {
        return res
          .sendStatus(404)
          .json({ message: err.message ? err.message : "JSON File Not Found" });
      }
      objectData = jsonString;
    }
  );

  res.sendStatus(200).json(objectData);
});

server.put("/data/:repository", (req, res) => {
  // validate json
  try {
    JSON.parse(req.body);
  } catch (err) {
    return res
      .sendStatus(500)
      .json({ message: err.message ? err.message : "Invalid JSON submitted" });
  }

  const oid = new uuid();
  let size;

  // check if directory exists
  fs.accessSync(`./data/${req.query.repository}`, function (err) {
    // create dir if doesnt exist
    err && fs.mkdir(`./data/${req.query.repository}`);

    // store file in repository folder
    fs.writeFileSync(
      `./data/${req.query.repository}/${oid}.json`,
      JSON.stringify(req.body),
      "utf8",
      function (err) {
        if (err) {
          return res
            .sendStatus(500)
            .json({
              message: err.message ? err.message : "File Could Not Be Written",
            });
        }
      }
    );
  });

  res.sendStatus(201).json({ oid, size });
});



if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
