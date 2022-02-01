const Review = require("../models/reviewModel");
const Tour = require("../models/tourModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

exports.setTourUserIds = (req, res, next) => {
  // Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.updateReviewAvg = catchAsync(async (req, res, next) => {
  try {
    const newRating = req.body.rating;
    const review = await Review.findById(req.params.id);
    const oldRating = review.rating;
    const tourId = String(review.tour);
    const tour = await Tour.findById(tourId);
    const oldAvg = tour.ratingsAverage;
    const quantity = tour.ratingsQuantity;

    if (req.method === "PATCH") {
      const newAvg = (oldAvg * quantity - oldRating + newRating) / quantity;
      await Tour.findByIdAndUpdate(tourId, { ratingsAverage: newAvg });
    }
    if (req.method === "DELETE") {
      if (quantity === 1) {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsAverage: 4.5,
          ratingsQuantity: 0,
        });
        next();
      }
      const newAvg = (oldAvg * quantity - oldRating) / (quantity - 1);
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: newAvg,
        ratingsQuantity: quantity - 1,
      });
    }
  } catch (err) {
    console.log("😀😀😀", err);
  }
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
