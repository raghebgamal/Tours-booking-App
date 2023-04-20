const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

/////////////////////////

const db = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);
mongoose.connect(db, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify:false
}).then(() => {
    console.log("db connection successful");
})//.catch(err=>console.log("error"));






const port =3000;
const server=app.listen(port, () => {
    console.log("app is running at port 3000");
});


process.on("unhandledRejection", (err) => {
    console.log(err.name, "unhandle rejection   shut down");
    server.close(() => {
    process.exit(1);   
   }) 
    
})
process.on("uncaughtException", (err) => {
    console.log(err.name, "uncaughtException   shut down");
    server.close(() => {
        process.exit(1);
    })
    
});

