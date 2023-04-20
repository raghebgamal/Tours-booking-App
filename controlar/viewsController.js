const Tour = require('./../models/toursModels');
const User = require('./../models/usersModels');
const catchAsync = require('./../utility/catchAsync');
const AppError = require('./../utility/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
 console.log("from overview form")
  const tours = await Tour.find();

  
  res.status(200).render('overview', {
    title: "All tours",
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
   console .log("from tour and slug")
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  console.log("from login form")
   
  res.status(200).render('login')
});

exports.getAccount = catchAsync(async (req, res, next) => {
  console.log("from Account form")
   
  res.status(200).render('account', {
    title:"your account"
  })
});

