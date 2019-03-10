var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
const Comment = require("../models/comment");
const express = require('express');
const router = express.Router();

//============
//AUTH ROUTES
//============

router.get("/register", function (req, res) {
    res.render("register");
});

router.post("/register", function (req, res) {
    const newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect("register", {"error" : err.message});
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp");
            res.redirect("/campgrounds");
        });
    });
});

router.get("/login", function (req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate('local', {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function (req, res) {
    console.log("Poop");
});

router.get("/logout", function (req, res) {
    req.logOut();
    req.flash("success", "You are now Logged Out!")
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err || !foundCampground) {
                flash("error", "Whoops, we couldn't find that campground ):");
                res.redirect("/campgrounds");
            }else {
                if (foundCampground.creator.id.equals(req.user._id)) {
                    next();
                }
                else {
                    flash("error", "You do not have permission to do that")
                    res.redirect("back");
                }
            }
        });
    }
    else {
        res.redirect("back");
    }
};

function checkCommentOwnership(req, res, next){
    if (req.isAuthenticated()) {
        Comment.findById(req.params.commentId, function(err, comment) {
            if (err || !comment) {
                flash("error", err.message)
                res.redirect("back");
            }
            else {
                if (comment.author.id.equals(req.user._id)) {
                    req.comment = comment
                    next();
                }
                else {
                    flash("error", "You do not have permission to do that")
                    res.redirect("back");
                }
            }
        });
    }
    else {
        res.redirect("back");
    }
};

module.exports = {
    "router" : router,
    "isLoggedIn" : isLoggedIn,
    "checkCampgroundOwnership" : checkCampgroundOwnership,
    "checkCommentOwnership" : checkCommentOwnership
}