const mongoose = require("mongoose");
const Tour = require("./../../models/toursModels");
const User = require("./../../models/usersModels");
const Review = require("./../../models/reviewModels");


const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

/////////////////////////

const db = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:false
}).then(() => {
    console.log("db connection successful");
});
////////////////////////////////////////
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

const importData = async () => {
    try {
        await Tour.create(tours,{validateBeforeSave:false})
       // await User.create(users,{validateBeforeSave:false})
        
       // await Review.create(reviews)


        console.log("date imported")
        process.exit();
    } catch (err) {
        console.log(err);
    }
    
};
const deleteData = async() => {
    try {
        await Tour.deleteMany();
        //await User.deleteMany();
        //await Review.deleteMany();


        console.log("data deleted");
        process.exit();

    } catch (err) {
                console.log(err);

    }
    
}

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}