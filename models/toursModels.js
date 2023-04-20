const mongoose = require("mongoose");
const validator = require("validator");
const User = require("./usersModels");
const slugify = require('slugify');

const tourSchema =new mongoose.Schema({
    name: {
        type: String,
        required: [true, "tour must have a name"],
        unique: true,
        trim: true,
        maxlength: [40, "the name length is too long"],
        minlength: [10, "the name length is short"],
       // validate:[validator.isAlpha,"tour name must  only contain a chars"]
    },
    slug: String,
    duration: {
        type: Number,
        required:[true,"tour must have a duration"]
    },
    maxGroupSize: { 
        type: Number,
        required:[true,"tour must have a maxGroupsize"]
    },
    difficulty: {
        type: String,
        required: [true, "a tour must have a difficulty"],
        enum: {
            values: ["easy","medium","difficult"],
            message:"difficulty must be easy or medium or difficult only"
        }
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, "ratings must below five"],
        min: [1, "ratings must above one"],
        set:val=>Math.round(val*10)/10
    },
    ratingsQuantity: {
        type: Number,
        default:0
    },
    secretTour: {
        type: Boolean,
        default:false
    }
    ,
    price: {
        type: Number,
        required:[true,"tour must have a price"]
    },
    priceDiscount: {
       type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message:"the priceDiscount({VALUE})should be less than price)"
        }
    },
    summary: {
        type: String,
        trim: true,
        required:[true,"a tour must have a summary"]
    },
    description: {
        type: String,
        trim:true
    },
    imageCover: {
        type: String,
        required:[true,"a tour must have a imageCover"]

    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select:false
    },
    startDates: [Date],
     startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: User
    }
    ]

    

   
}, {
    toJSON: { virtuals: true },
    toObject:{ virtuals: true }
});
tourSchema.index({price:1})
tourSchema.index({ slug: 1 })
tourSchema.index({startLocation:"2dsphere"})
 tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.virtual("durationforweak").get(function () {
    return this.duration/7
})
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/*
tourSchema.pre('save', async function (next) {
    console.log(this.guides)
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    console.log(guidesPromises)
    this.guides = await Promise.all(guidesPromises);
    console.log(this.guides)
   next();
 });

*/

//tourSchema.pre("save", function (next) {
    
 //   next();
 // })
/*
tourSchema.post("save", function (doc, next) {
    console.log("-----------------------")
    console.log(this)
    console.log("------------------------")
    console.log(doc)
    console.log("---------------------------")
    next();
})
*/
tourSchema.pre(/^find/, function (next) {
   this.populate({
        path: "guides",
    select:"-__v -passwordChangedAt"});
    
    
    next();
})
//tourSchema.pre(/^find/, function (next) {
   
   // this.find({ secretTour: { $ne: true } })
   // this.start = Date.now();
    
   // next();
//})
//tourSchema.post(/^find/, function (doc,next) {
   
 // console.log( Date.now()-this.start)
    
//    next();
//})
/*
tourSchema.pre("aggregate", function (next) {
   
this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    
    next();
})
    */


const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;