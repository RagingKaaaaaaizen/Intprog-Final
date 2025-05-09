const http = require('http');

// Function to keep the server alive
function keepAlive() {
  setInterval(() => {
    const options = {
      host: process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co',
      path: '/'
    };
    http.get(options, (res) => {
      console.log('Keeping the server alive - ' + new Date());
    }).on('error', (err) => {
      console.log('Error pinging the server: ' + err.message);
    });
  }, 280000); // Ping every 4 minutes 40 seconds
}

module.exports = keepAlive; 