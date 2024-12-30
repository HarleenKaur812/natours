const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const factory = require('./factoryHandler');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
// const AppError = require('./../utils/appError');
// const catchAsync = require('./../utils/catchAsync');

exports.setUserTourIDs = (req, res, next) => {
  //for nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.checkBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({
    user: req.user.id,
    tour: req.body.tour,
  });
  if (bookings.length === 0) {
    return next(new AppError('You can only review the booked tours!', 401));
  }
  next();
});
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createNewReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
