const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down');
  console.log(err.name, err.message);

  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

console.log(DB);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(e => console.log('Logging database successfully'));

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION 💥 Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
