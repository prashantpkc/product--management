const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')


const userModel= require("../models/userModel");


//_____________Authentication______________________

exports.authenticate = (req, res, next) => {
    try{
          let token = req.headers["authorization"];


          if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

          let bearer = token.split(" ")  
          let bearerToken = bearer[1]

          jwt.verify(bearerToken, "Project-5-productsManagement", function (err, decode) {
          if (err) { return res.status(401).send({ status: false, message: err.message }) }
          req.decode = decode;
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

          if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"Invalid userId"})

          let gettingUserId= await userModel.findById({_id: userId})
          if(!gettingUserId) return res.status(404).send({status:false,message:"this userId is not found"})
          
          req.userDetails = gettingUserId

          if ( userId !=req.decode.userId)  return res.status(403).send({ status: false, message: "you are not Athorised to do this" });

          return next()
    }catch(error){
          return res.status(500).send({message: error.message})
     }
  }