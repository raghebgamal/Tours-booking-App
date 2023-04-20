const mongoose = require("mongoose");
const Tour = require("./toursModels");
const AppError=require("./../utility/appError")
const reviewSchema =  new mongoose.Schema({
    review: {
        type: String,
        required: [true, "review can not be empty"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "review must belong to a tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "review must belong to a user"]

    }


}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
reviewSchema.index({ tour: 1, user: 1 },{ unique: true})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: "$tour",
                nRatings: { $sum: 1 },
                avgRatings: { $avg: "$rating" }
            }
        }

    ]);
    console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId,
            { ratingsAverage: stats[0].avgRatings, ratingsQuantity: stats[0].nRatings });
    } else {
        await Tour.findByIdAndUpdate(tourId,
            { ratingsAverage: 4.5, ratingsQuantity: 0 });
        console.log("document not found in db")
    }

}

reviewSchema.post("save", function () {
   
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne(); 
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    if (!this.review) return next(
        new AppError("id not found with this document , no document found to delete or update", 404));;
 
        await this.review.constructor.calcAverageRatings(this.review.tour);
    
    
  
});


reviewSchema.pre(/^find/,   function (next) {
    this.populate({path: "user",select:"name photo"})//.populate({ path: "tour", select: "name " })
    next();
})
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
