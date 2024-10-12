const express = require('express');
const router = express.Router();
const User = require("../models/user.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
    // res.send("Not working");
});

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password , confirmPassword} = req.body;

        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect("/listings");
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        console.log(registeredUser);
       req.flash("success", "Welcome to ZookStay");
        res.redirect("/listings");
    } catch (e) {
        console.error("Error during registration:", e); // Add more logging for debugging
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
});


module.exports = router;
