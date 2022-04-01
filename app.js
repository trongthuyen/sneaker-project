const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const sneakerRouter = require('./routes/sneakerRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

//1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());
///////////////////////////////////
//Set up viewengine and views path
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

////////////////////////////
//Setup staticpath
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/////////////////////////////
// Limit requese from an IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try agian later'
});

app.use('/api', limiter);

app.use(express.static(path.join(__dirname, 'public')));

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

app.use(cors())

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(path.join(__dirname, 'views'));
  // console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/sneaker', sneakerRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  return next(new AppError('This route is not supported', 400));
});
app.use(globalErrorHandler);
module.exports = app;
