const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


app.set("view engine" , "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.listen(8080,()=>{
    console.log("Server is running at 8080");
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
    console.log(deletedListing);
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
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs" , {listing});
});

//post route for new form
app.post("/listings" , async (req,res)=>{
   const newListing =  new Listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings");
});

//edit route
app.get("/listings/:id/edit" , async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});
});

//privacy route
app.get("/privacy" , (req,res)=>{
    res.render("/footer/privacy.ejs");
});

//terms route
app.get("/terms" , (req,res)=>{
    res.render("/footer/terms.ejs");
});