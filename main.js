require('dotenv').config();

const server = require('./server');
const port = process.env.PORT || 1337;

server.listen(port, () => {
  console.log('The magic happen on port :' + port);
});