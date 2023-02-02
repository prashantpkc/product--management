const mongoose = require("mongoose");
const userModel = require("../models/userModel")
const upload = require("../aws/aws")
const bcrypt = require('bcrypt')

const {isValidEmail,isValidphone,isValidName,isValidpassword,isValidCity,isValidPinCode}=require('../validator/validator')

module.exports.createUser = async (req, res) => { //doubt//
try {
	    let data = req.body 
	    let files = req.files
		let uploadUrl 
	
	    if(files && files.length>0){ //doubt//
	         uploadUrl = await upload.uploadFile(files[0]) //doubt//
	    }else {return res.status(400).send({status:false, message: "please give files"})}
	
	    let {fname, lname, email, phone, password, address} = data

		if(Object.keys(data).length == 0){return res.status(400).send({status:false, message : "body cant be empty"})}
	
	    if(!fname){return res.status(400).send({status:false, message: "fname is required"})}
		if(!isValidName(fname)) return res.status(400).json({status:false,message:"please provide valid first name"}) //doubt//
	   else{fname = fname.trim() }
	
	   if(!lname){return res.status(400).send({status:false, message: "lname is required"})}
	   if(!isValidName(lname)) return res.status(400).json({status:false,message:"please provide valid last name"})
	   else{lname = lname.trim() }
	
	   if(!email){return res.status(400).send({status:false, message: "email is required"})}
	   if(!isValidEmail(email))  return res.status(400).json({status:false,message:"please provide valid email"})
	   else{email = email.trim() }
	
	   if(!phone){return res.status(400).send({status:false, message: "phone is required"})}
	   if(!isValidphone(phone)) return res.status(400).json({status:false,message:"please provide valid indian phone number"})
	   else{phone = phone.trim()}
	
	   if(!password){return res.status(400).send({status:false, message: "password is required"})}
	   if(!isValidpassword(password)) return res.status(400).json({status:false,message:"please provide valid password and password must contains minimum 8 characters and maximum 15 characters"})
	   else{password = password.trim() }

	   let pwd = await bcrypt.hash(password, 10)

	   const checkEmail = await userModel.findOne({email:email}) //doubt//
	   if(checkEmail) return res.status(409).send({status: false, message: "email is already exits"})

	   const checkPhone = await userModel.findOne({phone:phone})
	   if(checkPhone) return res.status(409).send({status: false, message: "phone is already exits"})

	    let newAddress = JSON.parse(address)
      
		 if(typeof newAddress !== "object") return res.status(400).send({status:false, message: "Address must be in object"}) //***doubt***//

		 let {shipping,billing} = newAddress

		 if( !shipping.street) return res.status(400).send({ status: false, message: "Please provide street name in your shipping address." })
		 

		 if(!shipping.city) return res.status(400).send({ status: false, message: "Please provide city name in your shipping address." })
		 if(!isValidCity(shipping.city))  return res.status(400).send({ status: false, message: 'Invalid shipping city' })

		 if(!shipping.pincode) return res.status(400).send({ status: false, message: "Please provide pincode in your shipping address.." })
		 if(!isValidPinCode(shipping.pincode))  return res.status(400).send({ status: false, message: 'Invalid Shipping pincode' })

		 if( !billing.street) return res.status(400).send({ status: false, message: "Please provide strret name in your billing address." })
		


		 if(!billing.city) return res.status(400).send({ status: false, message: "Please provide city name in your billing address.." })
		 if(!isValidCity(billing.city))  return res.status(400).send({ status: false, message: 'Invalid Billing city' })

		 if(!billing.pincode) return res.status(400).send({ status: false, message: "Please provide pincode in your billing address.." })
		 if(!isValidPinCode(billing.pincode)) return res.status(400).send({ status: false, message: 'Invalid Billing pincode' })


	   
	  let userData = {fname, lname, email, phone, password:pwd,address:newAddress,profileImage:uploadUrl}
	   
	   let saveData = await userModel.create(userData)
	
	   return res.status(201).send({status:true, message:"User created successfully", data:saveData})
	
} catch (error) {
	console.log(error.message);
	res.status(500).send({status:false, message : error.message})
}
}





