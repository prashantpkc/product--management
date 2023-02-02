const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const upload = require("../aws/aws");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  isValidEmail,
  isValidphone,
  isValidName,
  isValidpassword,
  isValidCity,
  isValidPinCode,
} = require("../validator/validator");

module.exports.createUser = async (req, res) => {
  //doubt//
  try {
    let data = req.body;
    let files = req.files;
    let uploadUrl;

    if (files && files.length > 0) {
      //doubt//
      uploadUrl = await upload.uploadFile(files[0]); //doubt//
    } else {
      return res
        .status(400)
        .send({ status: false, message: "please give files" });
    }

    let { fname, lname, email, phone, password, address } = data;

    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "body cant be empty" });
    }

    if (!fname) {
      return res
        .status(400)
        .send({ status: false, message: "fname is required" });
    }
    if (!isValidName(fname))
      return res.status(400).send({
        status: false,
        message: "please provide valid first name",
      });
    //doubt//
    else {
      fname = fname.trim();
    }

    if (!lname) {
      return res
        .status(400)
        .send({ status: false, message: "lname is required" });
    }
    if (!isValidName(lname))
      return res
        .status(400)
        .send({ status: false, message: "please provide valid last name" });
    else {
      lname = lname.trim();
    }

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }
    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "please provide valid email" });
    else {
      email = email.trim();
    }

    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "phone is required" });
    }
    if (!isValidphone(phone))
      return res.status(400).send({
        status: false,
        message: "please provide valid indian phone number",
      });
    else {
      phone = phone.trim();
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }
    if (!isValidpassword(password))
      return res.status(400).send({
        status: false,
        message:
          "please provide valid password and password must contains minimum 8 characters and maximum 15 characters",
      });
    else {
      password = password.trim();
    }

    let pwd = await bcrypt.hash(password, 10);

    const checkEmail = await userModel.findOne({ email: email }); //doubt//
    if (checkEmail)
      return res
        .status(409)
        .send({ status: false, message: "email is already exits" });

    const checkPhone = await userModel.findOne({ phone: phone });
    if (checkPhone)
      return res
        .status(409)
        .send({ status: false, message: "phone is already exits" });

    let newAddress = JSON.parse(address);

    if (typeof newAddress !== "object")
      return res
        .status(400)
        .send({ status: false, message: "Address must be in object" }); //***doubt***//

    let { shipping, billing } = newAddress;

    if (!shipping.street)
      return res.status(400).send({
        status: false,
        message: "Please provide street name in your shipping address.",
      });

    if (!shipping.city)
      return res.status(400).send({
        status: false,
        message: "Please provide city name in your shipping address.",
      });
    if (!isValidCity(shipping.city))
      return res
        .status(400)
        .send({ status: false, message: "Invalid shipping city" });

    if (!shipping.pincode)
      return res.status(400).send({
        status: false,
        message: "Please provide pincode in your shipping address..",
      });
    if (!isValidPinCode(shipping.pincode))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Shipping pincode" });

    if (!billing.street)
      return res.status(400).send({
        status: false,
        message: "Please provide strret name in your billing address.",
      });

    if (!billing.city)
      return res.status(400).send({
        status: false,
        message: "Please provide city name in your billing address..",
      });
    if (!isValidCity(billing.city))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Billing city" });

    if (!billing.pincode)
      return res.status(400).send({
        status: false,
        message: "Please provide pincode in your billing address..",
      });
    if (!isValidPinCode(billing.pincode))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Billing pincode" });

    let userData = {
      fname,
      lname,
      email,
      phone,
      password: pwd,
      address: newAddress,
      profileImage: uploadUrl,
    };

    let saveData = await userModel.create(userData);

    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: saveData,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.login = async (req, res) => {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is required" });

    // let checkPass = await bcrypt.compare(password,data.passwordHash)
    // if(!checkPass)return res.status(400).send({status:false,message:"password is incorrect"})
    let findCredential = await userModel.findOne({ email: email });
    if (!findCredential)
      return res
        .status(400)
        .send({ status: false, message: "email is incorrect" });
    let checkPass = await bcrypt.compare(password, findCredential.password);
    if (!checkPass)
      return res
        .status(400)
        .send({ status: false, message: "password is incorrect" });

    let user = findCredential._id; // use bcript

    let token = jwt.sign(
      {
        userId: user,
      },
      "Project-5-productsManagement",
      { expiresIn: "1h" }
    );

    //res.bearerToken
    return res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { userId: user, token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
//get userDetails by params
exports.getUser = async (req, res) => {
  try {
    let userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "userId is not valid" });

    let getData = await userModel.findById({ _id: userId });
    if (!getData)
      return res.status(404).send({
        status: false,
        message: `data not found with this ID ${userId}`,
      });

    res
      .status(200)
      .send({ status: true, message: "User profile details", data: getData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// UPDATE USER DETAILS

exports.updateUser = async (req, res) => {
 try {
	 let userId = req.params.userId;
	  let data = req.body;
	  let files = req.files;
	
	  if (files && files.length > 0) {
	    data.profileImage = await upload.uploadFile(files[0]);
	 } //else {
	//     return res
	//       .status(400)
	//       .send({ status: false, message: "please give files" });
	//   }
	
	  let { fname, lname, email, phone, password, address } = data;
	
	  if (Object.keys(data).length == 0)
	    return res
	      .status(400)
	      .send({ status: false, message: "please provide data for update" });
	

		  if(fname){
	  if (!isValidName(fname) )
	    return res.status(400).send({
	      status: false,
	      message: "please provide valid first name",
	    });
	  //doubt//
	  else {
	    fname = fname.trim();
	  }
	}


	if(lname){
	  if (!isValidName(lname)||data.lname == "")
	    return res
	      .status(400)
	      .send({ status: false, message: "please provide valid last name" });
	  else {
	    lname = lname.trim();
	  }
	}


	if(email){
	  if (!isValidEmail(email))
	    return res
	      .status(400)
	      .send({ status: false, message: "please provide valid email" });
	  else {
	    email = email.trim();
	  }
	}
	

	if(phone){
	  if (!isValidphone(phone))
	    return res.status(400).send({
	      status: false,
	      message: "please provide valid indian phone number",
	    });
	  else {
	    phone = phone.trim();
	  }
	}
	
	if(password){
	  if (!isValidpassword(password))
	    return res.status(400).send({
	      status: false,
	      message:
	        "please provide valid password and password must contains minimum 8 characters and maximum 15 characters",
	    });
	  else {
	    password = password.trim();
	  }
	}
	
let newAddress
	if(address){
	   newAddress = JSON.parse(address);
	
	    if (typeof newAddress !== "object")
	      return res
	        .status(400)
	        .send({ status: false, message: "Address must be in object" }); //***doubt***//
	
	    let { shipping, billing } = newAddress;
	
	
	    if (!isValidCity(shipping.city))
	      return res
	        .status(400)
	        .send({ status: false, message: "Invalid shipping city" });
	
	
	    if (!isValidPinCode(shipping.pincode))
	      return res
	        .status(400)
	        .send({ status: false, message: "Invalid Shipping pincode" });
	
	  
	    if (!isValidCity(billing.city))
	      return res
	        .status(400)
	        .send({ status: false, message: "Invalid Billing city" });
	
	  
	    if (!isValidPinCode(billing.pincode))
	      return res
	        .status(400)
	        .send({ status: false, message: "Invalid Billing pincode" });
	}
	
		// let olduserData = await userModel.findById(userId)
	
		let dataToBeUpdate= {fname:fname,lname:lname,email:email,phone:phone,password:password,profileImage:data.profileImage,address:newAddress}
	
		const updateData = await userModel.findByIdAndUpdate({_id:userId},dataToBeUpdate,{new:true})
	
		return res.status(200).send({status:false,message:"User profile updated", data:updateData})
} catch (error) {
	console.log(error);
	res.status(500).send({ status: false, message: error.message });
	
}




};
