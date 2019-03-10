const auth = require("./auth");
const isLoggedIn = auth.isLoggedIn;
var Campground = require("../models/campground");
var Comment = require("../models/comment");
const express = require('express');
const router = express.Router({mergeParams: true});
const checkCommentOwnership = auth.checkCommentOwnership;

// ====================
// COMMENTS ROUTES
// ====================
router.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
    // find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds/"+req.params.id, {"error" : err.message })
        } else {
            res.render("comments/new", { campground: campground });
        }
    });
});

router.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds", {"error" : err.message });
        }
        else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    return res.redirect("/campgrounds", {"error" : err.message });
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
                    flash("success", "Successfully posted Your new comment");
                    return res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect campground show page
});

//Edit
router.get("/campgrounds/:id/comments/:commentId/edit", checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
            res.redirect("/campgrounds/"+req.params.id);
        }else {
            Comment.findById(req.params.commentId, function(err, comment){
                if(err){
                    console.log(err)
                    res.redirect("/campgrounds/"+req.params.id);
                }else {
                    const info = { 
                        comment : comment,
                        campground : campground
                    }
                    res.render("comments/edit", info);
                }
            });
        }
    });
});

//UPDATE
router.put("/campgrounds/:id/comments/:commentId", checkCommentOwnership,  function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, {text: req.body.comment.text},function (err, updatedComment){
        if(err){
            console.log(err)
            console.log(req.params.id);
            return res.redirect("/campgrounds/"+ req.params.id, {"error" : err.message});
        }else {
            flash("success", "Updated comment!");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

//Delete
router.delete("/campgrounds/:id/comments/:commentId", checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/campgrounds/"+req.params.id);
    });
});

module.exports = router;