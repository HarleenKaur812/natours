const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/"([^"]*)"/)[0];
  const message = `Duplicate Field value ${value}. Please use another one!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token , Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired , Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //B) RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};
const sendErrorProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error :send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //Programming or other unknown error: Dont leak error details
    } else {
      //1) Log error to console
      console.error('ERROR: ', err);

      //2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: ' Something went wrong!',
      });
    }
  } else {
    //B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      console.log(err);
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // we have created a shallow copy of err, because it is not advisable to change the original object
    let error = Object.create(err);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
