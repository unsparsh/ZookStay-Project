const mongoose = require("mongoose");
const reviews = require("./reviews");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  // image:{
  //   filename : {type:String},
  //   url : {type:String}
  // },
  image: String,

  price: Number,
  location: String,
  country: String,
  reviews : [
    {
      type: Schema.Types.ObjectId,
      ref : "Review",
    },
  ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;