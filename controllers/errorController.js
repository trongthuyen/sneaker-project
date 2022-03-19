const AppError = require('../utils/appError');

const handledInvalidToken = () => {
  return new AppError('Invalid token. Please log in again', 401);
};

const sendErrorDev = (err, req, res) => {
  //For APi
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  console.log(req.originalUrl.startsWith('/api'));
  //RENDER
  console.error('ERROR 💥', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  //For APi
  if (req.originalUrl.startsWith('/api')) {
    //Trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    //Unoperational, other error
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  //Unoperational, other error

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let newError = { ...err };
    if (newError.name === 'JsonWebTokenError') {
      newError = handledInvalidToken();
    }
    sendErrorProd(newError, req, res);
  }
};
