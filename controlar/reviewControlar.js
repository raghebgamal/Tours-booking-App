const catchasync = require("./../utility/catchAsync");
const Review = require("./../models/reviewModels");
const Factory = require("./handellerFactory");

exports.setTourAndUserIds=(req,res,next)=>{
     if (!req.body.tour) {
        req.body.tour = req.params.tourId;
    }
    if (!req.body.user) {
        req.body.user = req.user.id;
    }

    next();
}



exports.getAllReview = Factory.getAllModel(Review);
exports.getOneReview = Factory.getOneModel(Review);
exports.createReview = Factory.createModel(Review);
exports.deleteReview = Factory.deleteModel(Review);
exports.updateReview = Factory.updateModel(Review);