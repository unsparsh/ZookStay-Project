const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const session = require('express-session');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Models
const Listing = require("./models/listing");
const Review = require('./models/reviews');

// Routes
const userRouter = require("./routes/user.js");

// Setup view engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.engine("ejs", ejsMate);

// Middleware for forms, JSON, and method override
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session configuration and flash
const sessionOptions = {
    secret: "hetal",
    resave: false,
    saveUninitialized: true,  // Fixed typo here
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Passport setup for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set flash messages and user data in all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; // For logged-in user availability in templates
    next();
});

// Route handlers
app.use("/", userRouter);

// Home route
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Listings routes
app.get("/listings", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Error fetching listings");
    }
});

// New listing route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Show listing route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));

// Create new listing route
app.post("/listings", wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// Edit listing route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}));

// Update listing route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

// Delete listing route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

// Review routes
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review added!");
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}));

// Privacy and Terms routes
app.get("/privacy", (req, res) => {
    res.render("footer/privacy");
});

app.get("/terms", (req, res) => {
    res.render("footer/terms");
});

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error/errorpage", { err });
});

// MongoDB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/zookstay";
async function main() {
    await mongoose.connect(MONGO_URL);
}
main().then(() => {
    console.log("Connected to the Backend");
}).catch((err) => {
    console.log(err);
});

// Start the server
app.listen(8080, () => {
    console.log("Server is running at http://localhost:8080/");
});
