const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! 💥 Shutting down ...', err);
  // console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log(`DB running at ${DB} ... ✅`);
});

// TODO: why is app required after mongoose connect?
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} ... ✅`);
});

// Handling unhandled rejected promises
// It's like a safety net that we need for cases we have not handled
// It's not ideal at all, some people actually say we should not use stuff like that.
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! 💥 Shutting down ...', err);
  // console.log(err.name, err.message);
  server.close(() => {
    // we first gracefully closes the server (closing current requests for example)
    process.exit(1);
  });
});
