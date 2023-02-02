const jwt = require('jsonwebtoken');
// const cartModel = require('../model/cartModel');
// const {isValidObjectId}= require('../util/validator')

const userModel= require("../models/userModel");


//_____________Authentication______________________

exports.authenticate = (req, res, next) => {
    try{
          let token = req.headers["authorization"];
          token = token.slice(7)

          if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

          jwt.verify(token, "Project-5-productsManagement", function (err, decode) {
          if (err) { return res.status(401).send({ status: false, message: err.message }) }
          req.decode = decode;
           next();

      })

    }
          catch (error) {
          res.status(500).send({ staus: false, msg: error.message });
    }
}

//_______________Authorization_____________________

exports.authorize= async function ( req, res, next) {
    try{
          let userId= req.params.userId
          if(!isValidObjectId(userId)) return res.status(400).send({status:false,message:"Inavlid userId"})

          let gettingUserId= await userModel.findById({_id: userId})
          if(!gettingUserId) return res.status(404).send({status:false,message:"this userId is not found"})

          if ( userId !=req.decode.userId)  return res.status(403).send({ status: false, message: "you are not Athorised" });

          return next()
    }catch(error){
          return res.status(500).send({msg: error.message})
     }
  }