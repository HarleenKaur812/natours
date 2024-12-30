const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSantitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) MIDDLEWARES
//set security HTTP headers
app.use(helmet());

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'http://127.0.0.1:3000',
  'https://natoursapp-hpa1.onrender.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);
//To serve static files, inbuilt middleware
app.use(express.static(path.join(__dirname, 'public')));

//Morgan middleware :It provides detailed logs for each request, including method, URL, status code, response time, and more.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Compression middleware
app.use(compression());

//limiter is a middleware function used to limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 24 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Body parser, extract this JSON payload from the request and convert it into a JavaScript object.
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NOSQL query injection
app.use(mongoSantitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//Test middleware
app.use((req, res, next) => {
  //console.log('Hello from the Middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://natoursapp-hpa1.onrender.com'],
  }),
);

//2) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//Handling unhandled routes, using middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!,`, 404));
});

//Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
