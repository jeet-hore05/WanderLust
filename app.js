const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

const Review=require("./models/review.js");

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

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
   
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
   
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}



//index route

app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
        console.log(allListings);
        res.render("listings/index.ejs",{allListings});
}));

//new route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});
     

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params; 
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//create route
app.post("/listings",validateListing,wrapAsync( async(req,res,next)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(404,"send valid data for listing");
    // }

    const newListing=new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
})
);

//edit route

app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params; 
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

}));

//update route

app.put("/listings/:id",validateListing, wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(404,"send valid data for listing");
    }
    let {id}=req.params; 
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

// delete route

app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params; 
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Reviews 
//Post route
app.post("/listings/:id/reviews", validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

   res.redirect(`/listings/${listing._id}`);
}));


// app.get("/testListing", async(req,res)=>{
//     let sampleListing=new Listing(
//         {
//             title:"My new Villa",
//             description:"by the beach",
//             price:12000,
//             country:"India",
//         }
//     );
//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("Succesful Testing");
// });

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