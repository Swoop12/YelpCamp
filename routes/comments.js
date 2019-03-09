const auth = require("./auth");
const isLoggedIn = auth.isLoggedIn;
var Campground = require("../models/campground");
var Comment = require("../models/comment");
const express = require('express');
const router = express.Router({mergeParams: true});

// ====================
// COMMENTS ROUTES
// ====================
router.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
    // find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { campground: campground });
        }
    });
});

router.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    var commentsArray = [...campground.comments];
                    commentsArray.push(comment);
                    campground.comments = commentsArray;
                    campground.save();
                    console.log("Comment Saved");
                    console.log(campground);
                    console.log(comment);
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect campground show page
});

module.exports = router;