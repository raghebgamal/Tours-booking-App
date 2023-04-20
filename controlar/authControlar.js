
const { promisify } = require("util");
const User = require("./../models/usersModels");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utility/catchAsync");
const crypto = require("crypto");

const AppError = require("../utility/appError");
const sendEmail = require("../utility/email");
//const { locales } = require("validator/lib/isiban");
const token_sign = id => {
    return jwt.sign({ id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRED
    }) 
}

const createSendToken = (user, statusCode, res) => {
    const token = token_sign(user._id);
    
    const cookieoption={
        expires: new Date(Date.now() + process.env.JWT_EXPIRED_COOKIE * 24 * 60 * 60 * 1000),
        httpOnly:true
    }
    if (process.env.NODE_ENV === "production") {
        cookieoption.secure = true;
    }
    res.cookie("jwt", token, cookieoption)
    user.password = undefined;

    res.status(statusCode).json({
        status: "success", token, user
    })

};
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10* 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.signup = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body);
   const url = `${req.protocol}://${req.get('host')}/me`;
        const sendmail = new sendEmail(user, url);
          await sendmail.sendWelcome()
        
    createSendToken(user, 200, res);
    console.log("sinup done")
});
exports.login = catchAsync(async (req, res, next) => {
    console.log("from login")
    const { password, email } = req.body;
    if (!password || !email) {
        return next(new AppError("plz provide your email or password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
   

    if (!user || !await user.correctPassword(password,user.password)) {
        return next(new AppError(" email or password is  incorrect", 401));
    }

    createSendToken(user, 200, res);
   
  


})
exports.protectTours = catchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization) {//&& req.headers.authorization.startsWith("Beares")) {
        token = req.headers.authorization.split(" ")[1];
   
    }else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    console.log("from protect","  the token : ",token)
    if (!token || token==="loggedout") {
        return next(new AppError
            ("token is not found or logged out,plz give me the token to access, you are not logged in ,plz log in to access ,plz login then set a token ", 401))
    } 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(" decoded  : from protect"  ,decoded)
   
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError("the token about user-id is not longer exist , plz login then set the token ", 401))

    }
    if (user.passwordChangedAfter(decoded.iat)) {
        return next(new AppError("the password has changed ,plz try again to log in ", 401))

    };
  
    req.user = user;
    res.locals.user = user;

    next();
});
exports.restrictUser = (...roles) => {
    return (req, res, next) => {
        
        if (!roles.includes(req.user.role)) {
            return next(new AppError("you have not a permision to access ", 401))
        }
        next();
        
    }
    
    
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
   
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("email address is not exist ", 404));
    }
   
    const resettoken = user.correctPasswordReset();
    await user.save({ validateBeforeSave: false });
    
    try {


        const resetURL = `${req.protocol}://${req.get("host")}$/api/v1/users/reserpassword/${resettoken}`;
        const sendemail = new sendEmail(user, resetURL);
        await sendemail.sendPasswordReset()
        


        res.status(200).json({status:"success",message:"token sent to email"})
        console.log("5")

    } catch (err) {
        console.log("6");
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("was an error  by sending mail ,try again ", 500));
    }

    
}
);

exports.resetPassword = catchAsync(async (req, res, next) => {
    console.log("from reset password")
   
    const hashedtoken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
    const user = await User.findOne({ passwordResetToken: hashedtoken,passwordResetExpired:{$gt:Date.now()} });
    if (!user) {
        return next(new AppError("token is invalid or expired ", 400));

    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save();

    createSendToken(user, 200, res);


    
});


exports.updatePassword = catchAsync(async (req, res, next) => {
    console.log("from updatepassword")
   
  
    const user = await User.findById(req.user.id).select("+password");
    
    if (! (await user.correctPassword(req.body.passwordCurrent, user.password))) {
          return next(new AppError("your current password is wrong ", 401));
    }


   user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    
    await user.save();

    createSendToken(user, 200, res);


});



exports.isLoggedIn = async (req, res, next) => {
    console.log("from is logedin out")

    if (req.cookies.jwt) {
        try {
            console.log("frem is logedin inside")
            console.log(`the req.cookies.jwt, token: ${req.cookies.jwt}`)
            let token = req.cookies.jwt;
            console.log("from is loggedin", "  the token : ", token)
            if (!token) {
                return next();
            }

            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

            console.log("decoded  : from is loggedin", decoded)
   
   
            const user = await User.findById(decoded.id);
            if (!user) {
                return next();
            }
            if (user.passwordChangedAfter(decoded.iat)) {
                return next()

            };
            res.locals.user = user;
            return next();
        } catch (err) {
            return next();
        
        }
    }
 
    next();
};



