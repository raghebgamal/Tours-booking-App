
const AppError = require("../utility/appError");
const Tour = require("./../models/toursModels");
const Factory = require("./handellerFactory");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utility/catchAsync");

//////////////////////////////

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null,true)
    } else {
        cb(new AppError("not an image ,plz uploude only images",400),false)
    }
    
}
const uploud = multer({ storage: multerStorage, fileFilter: multerFilter });

exports. uploudeTourImages = uploud.fields([{
    name: "imageCover", maxCount: 1
},
{
    name: "images", maxCount: 3
    
    }]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover||!req.files.images) return next();
        
   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
   await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 })
        .toFile(`public/img/tours/${ req.body.imageCover}`);
    
   /* 
    for (let i = 0; i < 3; i++) {
        req.files.images[i].filename = `tour-${i}-${req.user.id}.jpeg`
      await  sharp(req.files.images[i].buffer).resize(500, 750).toFormat("jpeg").jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.files.images[i].filename}`);
    }
    */
    
    req.body.images = [];
    
    await Promise.all(req.files.images.map(async (el, i) => {
        

        const filename = `tour-${i + 1}-${req.params.id}-${Date.now()}.jpeg`
        await sharp(el.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename)
    })
    );

   
    next();
    
       

});


exports.theTopFiveCheap = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage";
    next();

};








exports.getAllTours = Factory.getAllModel(Tour);
/////////////////////////////////////
//create tour........
exports.postTours = Factory.createModel(Tour);

/////////////////////////////////////

exports. getOneTour = Factory.getOneModel(Tour)
/////////////////////////////////////

exports.updateTours = Factory.updateModel(Tour);

//////////////////////////////////

exports.deleteTours = Factory.deleteModel(Tour);

//////////////////////////////////////////

exports.toursStats = catchAsync(async (req, res,next) => {
   
    const stats = await Tour.aggregate([{
        $match: { ratingsAverage: { $gte: 4.5 } }

    }, {
        $group: {
            _id: "$difficulty",
            numTours: { $sum: 1 },
            numratings: { $sum: "$ratingsQuantity" },
            avgratings: { $avg: "$ratingsAverage" },
            maxratings: { $max: "$ratingsAverage" },
            minratings: { $min: "$ratingsAverage" },
            avgprice: { $avg: "$price" },
            maxprice: { $max: "$price" },
            minprice: { $min: "$price" },
                
                
        }
    },
    {
        $sort: { avgprice: 1 }
    }
    ]);

    res.status(200).json({ status: "sucsses", data: { stats } });
    
});
exports.numTourOfMonth = catchAsync(async (req, res,next) => {
    
    
    const year = req.params.year * 1
    const numOfTours = await Tour.aggregate([{
        $unwind: "$startDates"
    },
    {
        $match: {
            startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }
        }
    },
            
    {
        $group: {
            _id: { $month: "$startDates" },
            numtoursbymonth: { $sum: 1 },
            tourname: { $push: "$name" }
        }
    },
    {
        $addFields: { month: "$_id" }
    },
    {
        $project: {
            _id: 0
        }
    },
    {
        $sort: {
            numtoursbymonth: 1
        }
    }
            
            
           
    ]);

    res.status(200).json({ state: "sucsses", data: { numOfTours } });
    
});
//"/tour-within/:333/center/:31.046460395982958,31.35117840300992/unit/:mi"
exports.getTourWithin = catchAsync(async (req, res, next) => {
    const { distance, latlong, unit } = req.params;
    const [lat, long] = latlong.split(",")
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !long) {
        return next(new AppError("plz provide lat and longtiude ", 400));
    }
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } } })
    res.status(200).json({
        status: "success", results: tours.length, data: { tours }

    })

});
exports.getDistances = catchAsync(async(req, res, next) =>{
 const { latlong, unit } = req.params;
    const [lat, long] = latlong.split(",")

    if (!lat || !long) {
        return next(new AppError("plz provide lat and longtiude ", 400));
    }
    const multiplier=unit==="mi"?0.000621371:.001
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "point",
                    coordinates:[long*1,lat*1]
                },
                distanceField: "distance",
                distanceMultiplier:multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name:1
            }
        }
    ])




    res.status(200).json({
        status: "success",  data: { distances }
    })

});