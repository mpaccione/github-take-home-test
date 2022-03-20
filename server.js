// You are welcome to drop express for any other server implementation
const express = require('express')
const server = express()

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
module.exports = server

// We'll store the data in memory
const storage = {};

if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000
  server.listen((port), () => {
    console.log(`App listening at http://localhost:${port}`)
  })
}
