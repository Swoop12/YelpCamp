var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   price: String,
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   creator: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
});

campgroundSchema.pre("remove", async function() {
   await Comment.remove({
      _id: {
         $in: this.comments
      }
   })
});

module.exports = mongoose.model("Campground", campgroundSchema);