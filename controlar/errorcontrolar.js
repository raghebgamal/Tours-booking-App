const AppError = require("../utility/appError");
const hendleJWTError = (err) => new AppError("invalid token ,plz log in", 401);
const hendleJwTokenExpiredError = (err) => new AppError("token has expired ,plz log in again", 401);

const hendleValidatorError = (err) => {
    const error = Object.values(err.errors).map(el=>el.message)
    
    const message = `invalid name and value-----${error.join(",")} `
    return new AppError(message,400);
}
const hendleDublicateError = (err) => {
    
    const message = `dublicate name is found `
    return new AppError(message,400);
}
const hendleCastError = (err) => {
        return new AppError(`error Cast Error invalid ${err.path}----${err.value}`,400)
    }
const ErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode)
            .json({ status: err.state, message: err.message, error: err, stack: err.stack });
    } 
        
        return res.status(err.statusCode).render("error", {
            title: "something went wrong",
            msg:err.message
        });

    }

const Errorprod = (err, req, res) => {
    
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOpertionalError) {
          return res.status(err.statusCode)
                .json({ status: err.state, message: err.message })
        }   
          return res.status(err.statusCode)
                .json({
                    status: "error", message: "something went wrong"
                })
        }
    
    
        if (err.isOpertionalError) {
           return res.status(err.statusCode).render("error", {
            title: "something went wrong",
            msg:err.message
        });

           } 
    res.status(err.statusCode).render("error", {
        title: "something went wrong",
        msg: "plz try again later"
    });
           
        }



    

module.exports = (err, req, res, next) => {
    //const err2 =new AppError("error from here 1",404)
    //console.log("error fro here 2")
    err.statusCode = err.statusCode || 500;
    err.state = err.state || "error"
   
    if (process.env.NODE_ENV === "development") {
        console.log("from dev error")
        ErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        console.log("from prod error")


        let err2;

        //err2 = { ...err };
        // err2.message = err.message;
        //console.log(err2)
        if (err.name === "CastError") {
            err2 = hendleCastError(err);
            return Errorprod(err2, req, res);
        }
        if (err.code === 11000) {
            err2 = hendleDublicateError(err);
            return Errorprod(err2, req, res);
        }
        if (err.name === "ValidationError") {
            err2 = hendleValidatorError(err);
            return Errorprod(err2, req, res);
        }
        if (err.name === "JsonWebTokenError") {
            err2 = hendleJWTError(err);
        }
        if (err.name === "TokenExpiredError") {
            err2 = hendleJwTokenExpiredError(err);
            return Errorprod(err2, req, res);

        }

        Errorprod(err, req, res);
    }
};
    