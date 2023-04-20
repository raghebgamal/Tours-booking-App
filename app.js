const express = require("express");
const path = require("path");
const multer = require("multer");
const ratelimit = require("express-rate-limit");
const helmet = require("helmet");
const appError = require("./utility/appError");
const errorcontrolar = require("./controlar/errorcontrolar");
const app = express();
const cookieParser = require('cookie-parser');
const toursRouter = require("./routs/toursrouts");
const usersRouter = require("./routs/usersrouts");
const reviewsRouter = require("./routs/reviewsrouts");
const viewsRouter = require("./routs/viewrouts");
const bookingRouter = require("./routs/bookingrouts");

const morgan = require("morgan");
const mongosanitize = require("express-mongo-sanitize");
const xss_clean = require("xss-clean");
const hpp = require("hpp");
const pug = require("pug");
////////////////////////////////
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")));


app.use(helmet());

if (process.env.NODE_ENV === "development"||process.env.NODE_ENV === "production") {
    app.use(morgan("dev"));
    

}
const limiter = ratelimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message:"too many requests from this IP , plz try again in an hour"
})

app.use("/api", limiter);
////////////////////////////

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//////////////////////////////
app.use(mongosanitize());
app.use(xss_clean());
app.use(hpp({
    whitelist:["duration","ratingsAverage","ratingsQuantity","maxGroupSize","difficulty","price"]
}));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
  // console.log(req.cookies)
     
   next()
    
});

///////////////////////////////

app.use("/",viewsRouter);
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews",reviewsRouter);
app.use("/api/v1/bookings",bookingRouter);
//api/v1/bookings
app.all("*", (req, res,next) => {
    
    next(new appError(`can't find the (${req.originalUrl}) :url , in the server ,plz give me correct url`, 404));
});

app.use(errorcontrolar);

////////////////////////////////////////


module.exports = app;











