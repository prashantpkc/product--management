const mongoose = require("mongoose");
const userModel = require("../models/userModel")
const uploadFile = require("../aws/aws")

module.exports.createUser = async (req, res) => {
try {
	    let data = req.body 
	    let files = req.files
	
	    if(files && files.length>0){
	         let uploadUrl = await uploadFile.uploadFile(files[0])
	
	         uploadUrl = data.profileImage
	
	    }else {return res.status(400).send({status:false, message: "please give files"})}
	
	    let {fname, lname, email, phone, password} = data
	     data.address = JSON.parse(data.address)
         console.log(data.address)

        //  {"shipping" : { "street" : "ambagan dakshinpara",   "city" : "asansol", "pincode":713325},{"billing" : {"street" : "ambagan dakshinpara",   "city" : "asansol", "pincode":713325}}}
	    // let {shipping, billing} = data.address
	
	    // var {street, city, pincode} = address.shipping
	
	    // var {street, city, pincode} = address.billing
	
	    if(Object.keys(data).length == 0){return res.status(400).send({status:false, message : "body cant be empty"})}
	
	    if(!fname){return res.status(400).send({status:false, message: "fname is required"})}
	   else{fname = fname.trim() }
	
	   if(!lname){return res.status(400).send({status:false, message: "lname is required"})}
	   else{lname = lname.trim() }
	
	   if(!email){return res.status(400).send({status:false, message: "email is required"})}
	   else{email = email.trim() }
	
	   if(!phone){return res.status(400).send({status:false, message: "phone is required"})}
	   else{phone = phone.trim() }
	
	   if(!password){return res.status(400).send({status:false, message: "password is required"})}
	   else{password = password.trim() }
	
	   let {profileImage} = data
	   
	   let saveData = await userModel.create({fname, lname, email, phone, password,address,profileImage})
	
	   return res.status(201).send({status:true, message:"User created successfully", data:saveData})
	
} catch (error) {
	res.status(500).send({status:false, message : error.message})
}

}