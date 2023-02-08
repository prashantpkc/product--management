const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(  //it is inbuilt function to create schema
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 8, max: 15 }, //encyipted password
    address: {
      shipping: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        pincode: { type: Number, required: true, trim: true },
      },
      billing: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        pincode: { type: Number, required: true, trim: true },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);

// diff btw model and schema

// schema defines the structure of our document
// model provides an interface to the database for crud operation
