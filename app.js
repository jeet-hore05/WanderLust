const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings=require("./routes/listing.js");
const reviews = require("./routes/review.js");

main().then(()=>{
    console.log("Connected to DB")
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/WonderList")
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Hi, I am root");
});



const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
   
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

app.use("/listings",listings)

app.use("/listings/:id/reviews",reviews);


//error handling middleware

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong." } = err;
    res.render("error.ejs",{message})
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening");
});