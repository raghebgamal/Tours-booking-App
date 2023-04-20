
const multer = require("multer");
const AppError = require("../utility/appError");
const User = require("./../models/usersModels");
const catchasync = require("./../utility/catchAsync");
const Factory = require("./handellerFactory");
const sharp = require("sharp");
/*
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/users")
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
});
*/
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null,true)
    } else {
        cb(new AppError("not an image ,plz uploude only images",400),false)
    }
    
}
const uploud = multer({ storage: multerStorage, fileFilter: multerFilter });




exports.uploudUserPhoto = uploud.single("photo");

exports.resizeUserPhoto = catchasync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

const filterdObj = (obj, ...allowedfeilds) => {
    const newobj = {};
    Object.keys(obj).forEach(el => {
        if (allowedfeilds.includes(el)) {
            newobj[el] = obj[el];
    }
})

    return newobj;
}



exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}
///////////////////////////////////
exports.deleteMe = catchasync(async (req, res, next) => {
    const user=await User.findByIdAndUpdate(req.user.id,{active:false})
        res.status(204).json({ status: "success", data: null })

})
exports.updateMe = catchasync(async (req, res, next) => {
    console.log("from update-me")
    console.log(req.body)
    console.log(req.file)
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("this route is not for updatepassword,  you can use passwordupdate", 400))
    }
    
    const filterdBody = filterdObj(req.body, "name", "email")
    if (req.file) {
        filterdBody.photo = req.file.filename;
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, filterdBody, { new: true, runValidators: true });
   
    res.status(200).json({ status: "success", data: { user } })

});

exports.postUsers = function (req, res,next) {   
    
    res.status(200).json({ status: "success", message: "plz  go to use sign up instead to create user" });
   
   
}



exports.getAllUsers = Factory.getAllModel(User);


//////////////////////////////////

exports.getOneUser = Factory.getOneModel(User);
//////////////////////////////////

exports.updateUsers = Factory.updateModel(User);


////////////////////////////////////

exports.deleteUsers = Factory.deleteModel(User);

//////////////////////////////////////
