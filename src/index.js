const express = require("express");
// express is allowed to setup middleware to response to HTTP request
// express is web application framework for node js.
// express helps us to create single page or multipage in nodejs
// express helps manages our rotute with the server

const mongoose = require("mongoose");
const route = require("./routes/route");
// Multer is a node. js middleware for handling multipart/form-data , which is primarily used for uploading files.
const multer = require("multer");

const app = express();

app.use(express.json()); 
// It is used for to read the the JSON data that is requesting by client

app.use(multer().any());

mongoose.set("strictQuery", true);

mongoose.connect(
    "mongodb+srv://cassmmmg:Functionup2022@cluster0.quflkwm.mongodb.net/group9Database",
    { useNewUrlParser: true }
  )
  .then(() => console.log("mongoDb is connected"))
  .catch((err) => console.log(err));
 

// mongoose.connect("mongodb+srv://cassmmmg:Functionup2022@cluster0.quflkwm.mongodb.net/group9Database", (err, data) => {
//         if (err) console.log(err);
//         if (data) console.log("MongoDb is connected..");
//       });

app.use("/", route);

app.listen(3000, function () {
  console.log("express app is running on port ", 3000);
});



