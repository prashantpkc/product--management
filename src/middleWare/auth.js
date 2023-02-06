const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')


const userModel= require("../models/userModel");


//_____________Authentication______________________

exports.authenticate = (req, res, next) => {
    try{
          let token = req.headers["authorization"];

      //     let userId = req.params.userId
      //     if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"Inavlid userId"})

          if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

          let bearer = token.split(" ")  
          let bearerToken = bearer[1]

          jwt.verify(bearerToken, "Project-5-productsManagement", function (err, decode) {
          if (err) { return res.status(401).send({ status: false, message: err.message }) }
          req.decode = decode;
      //     if ( userId !=req.decode.userId)  return res.status(401).send({ status: false, message: "you are not allowed to access the resource" });
           next();
      })
    }
          catch (error) {
          res.status(500).send({ staus: false, message: error.message });
    }
}

//_______________Authorization_____________________

exports.authorize= async function ( req, res, next) {
    try{
          let userId= req.params.userId

          if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"Inavlid userId"})

          let gettingUserId= await userModel.findById({_id: userId})
          if(!gettingUserId) return res.status(404).send({status:false,message:"this userId is not found"})

          if ( userId !=req.decode.userId)  return res.status(403).send({ status: false, message: "you are not Athorised" });

          return next()
    }catch(error){
          return res.status(500).send({message: error.message})
     }
  }