const  model = require("mongoose");
const AppError = require("./../utility/appError");
const catchasync = require("./../utility/catchAsync");
const ApiFeaturs = require(`./../utility/apiFeatures`);


exports.deleteModel = model =>
    catchasync(async (req, res, next) => {

    
    const doc = await model.findByIdAndDelete( req.params.id );
   if(!doc) {
        return next(new AppError("id not found with this document , no document found to delete", 404));
    }
        res.status(204).json({ status: "success", data: { doc } });
   
});

exports.updateModel = model => catchasync(async (req, res, next) => {
    
    /*
    if (req.files) {
        req.body.imageCover = req.files.imageCover[0].filename;
        
        req.body.images = req.files.images.map(el => el.filename);

    }
    */
    
   console.log(req.body.imageCover)
   console.log(req.body.images)


    const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if(!doc) {
        return next(new AppError( "id not found with this document , no document found to update  ", 404));
    }
        res.status(200).json({ status: "success", data: { doc } });
    
    
});     

exports.createModel=model=>catchasync(async function (req, res,next) {   
    
    const doc = await model.create(req.body);
    res.status(200).json({ status: "success", data: { doc } });
   
   
});

exports.getOneModel=(model,populateOption)=>catchasync( async(req, res,next) => {
    let query = model.findById(req.params.id)
    if (populateOption) {
        query = query.populate(populateOption);
    }
    const doc = await query
   
    if(!doc) {
        return next(new AppError("id not found with this document , no document found to update  ", 404));
    }

        res.status(200).json({ status: "success", data: { doc } });
  
});

exports.getAllModel=model=>catchasync(async (req, res, next) => {
        let fillter = {};
    if (req.params.tourId) {
        fillter = { tour: req.params.tourId }
    }
           
    const featurs = new ApiFeaturs(model.find(fillter), req.query).filtering()
        .sorting()
        .fields()
        .paginate();
    const docs = await featurs.query;
    res.status(200).json({ status: "sucsses", results: docs.length, data: { docs } });
    
});
