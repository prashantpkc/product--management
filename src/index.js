const express = require("express");
const mongoose = require("mongoose")
const route = require("./routes/route")
const multer = require("multer")

const app = express()

app.use(express.json())

app.use(multer().any())

mongoose.set('strictQuery', true);

mongoose.connect("mongodb+srv://cassmmmg:Functionup2022@cluster0.quflkwm.mongodb.net/group9Database",{useNewUrlParser:true})

        .then(()=> console.log("mongoDb is connected"))
        .catch(err=> console.log(err))

app.use("/", route)

app.listen(3000, function () {console.log("express app is running on port ", 3000)})