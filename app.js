
var express     = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    seedDB          = require("./seeds"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    User            = require("./models/user"),
    campgroundRoutes = require("./routes/campgrounds"),
    authRoutes      = require("./routes/auth").router,
    commentRoutes   = require("./routes/comments");
    methodOverride  = require("method-override");
    flash           = require("connect-flash");

exports.express = express;
exports.app = app;
exports.bodyParser = bodyParser;
exports.mongoose = mongoose;
exports.Campground = Campground;
exports.Comment = Comment;
exports.seedDB = seedDB;
exports.passport = passport;
exports.LocalStrategy = LocalStrategy;
exports.User = User;
    
mongoose.connect("mongodb://localhost/yelpCamp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "The truth will set you free, but only after it is done with you",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(campgroundRoutes);
app.use(authRoutes);
app.use(commentRoutes);

app.get("/", function(req, res){
    res.render("landing");
});

app.listen(3000, function(){
   console.log("The YelpCamp Server Has Started!");
});