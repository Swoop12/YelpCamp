
var Campground = require("../models/campground");
var express = require("express");
const router = express.Router();
const auth = require("./auth");
const checkCampgroundOwnership = auth.checkCampgroundOwnership;

//INDEX - show all campgrounds
router.get("/campgrounds", function (req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            flash("error", err.message);
            console.log(err);
        }
        else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user });
        }
    });
});

//CREATE - add new campground to DB
router.post("/campgrounds", auth.isLoggedIn, function (req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price
    var user = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: name, image: image, description: desc, creator: user, price: price};
    // Create a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            flash("error", err.message);
            console.log(err);
        }
        else {
            flash("success", newlyCreated.name + " saved!");
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});
//NEW - show form to create new campground
router.get("/campgrounds/new", auth.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            flash("error", err.message);
            console.log(err);
        }
        else {
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req, res) {
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground : foundCampground});
        });
});

//UPDATE CAMPGROUD ROUTE
router.put("/campgrounds/:id", checkCampgroundOwnership, function(req, res) {
    console.log(req.params.id);
    console.log(req.body.campground);
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        console.log(updatedCampground);
        if(err){
            flash("error", err.message);
            res.redirect("/campgrounds")
        }else {
            flash("success", "Updated Campground!");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//DESTROY CAMPGROUND
router.delete("/campgrounds/:id", checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove( req.params.id, function(err){
        if(err){
            console.log(err)
            flash("error", err.message);
            res.redirect("/campgrounds")
        }else {
            flash("success", "Campground Deleted!")
            res.redirect("/campgrounds")
        }
    });
});

module.exports = router;
