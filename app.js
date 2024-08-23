const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const Review = require('./models/reviews'); // Path to your review model
const { reviewSchema } = require("./schema.js");

app.set("view engine" , "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


app.listen(8080,()=>{
    console.log("Server is running at 8080 at :- "+ " http://localhost:8080/");
});

app.get("/" , (req,res)=>{
    res.render("home.ejs");
});

const MONGO_URL = "mongodb://127.0.0.1:27017/zookstay";
async function main(){
    await mongoose.connect(MONGO_URL);
}
//to call main function
main().then(()=>{
    console.log("Connected to the Backend");
}).catch((err)=>{
    console.log(err);
});

//update route
app.put("/listings/:id" , async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id" ,async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(`Deleted File with id: ${id}`);
    res.redirect("/listings");
});

app.get("/listings", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings }); // Corrected line
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Error fetching listings");
    }
});

//new listing route
app.get("/listings/new", async (req, res) => {
    try {
        res.render("listings/new"); // Corrected line
    } catch (error) {
        console.error("Error creating new list:", error);
        res.status(500).send("Error fetching new form");
    }
});

//show routes
app.get("/listings/:id" , async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs" , {listing});
});

//post route for new form
app.post("/listings" ,
    wrapAsync( async (req,res)=>{
   const newListing =  new Listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings");
})
);

//edit route
app.get("/listings/:id/edit" , async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});
});

//privacy route
app.get("/privacy" , (req,res)=>{
    res.render("footer/privacy.ejs");
});

//terms route
app.get("/terms" , (req,res)=>{
    res.render("footer/terms.ejs");

});

//Review Page Routes
//post review route 
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
    let { id } = req.params;

    // Find the listing by ID
    let listing = await Listing.findById(id);

    // Create a new review with fields from the request body
    let newReview = new Review({
        Comment: req.body.Comment, // Ensure these match your form fields
        rating: req.body.rating
    });

    // Add the new review to the listing's reviews array
    listing.reviews.push(newReview);

    // Save the new review and the updated listing
    await newReview.save();
    await listing.save();

    console.log("New Review Saved");

    // Redirect to the listing's page
    res.redirect(`/listings/${id}`);
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req,res) =>{
    let {id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id , {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))


app.all("*" , (req,res,next) =>{
    next(new ExpressError(404 , "Page not Found!"));
} );

app.use((err,req,res,next) => {
    let {statusCode , message} = err;
    // res.status(statusCode).send(message);
    res.render("error/errorpage.ejs");
});


//validation schema for review form
const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) =>
            el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
};