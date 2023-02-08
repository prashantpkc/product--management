const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const upload = require("../aws/aws");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let { isValidEmail, isValidphone, isValidName, isValidpassword, isValidCity, isValidPinCode, isValidBody,
  checkSpaceBtwWord,
} = require("../validator/validator");

exports.createUser = async (req, res) => {
  try {
    let data = req.body;
    let files = req.files;
    let uploadUrl;

    if (files.length > 0) {
      uploadUrl = await upload.uploadFile(files[0]);
    } else {
      return res.status(400).send({ status: false, message: "please give files" });
    }

    let { fname, lname, email, phone, password, address } = data;

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "body cant be empty" });

    if (!isValidBody(fname)) return res.status(400).send({ status: false, Message: "Please provide your first name" });

    // this is used to remove spaces in between word.
    fname = checkSpaceBtwWord(fname);
    if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Firstname should only contain alphabet" });
    if (!isValidBody(lname)) return res.status(400).send({ status: false, Message: "Please provide your last name" });

    lname = checkSpaceBtwWord(lname);
    if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Lastname should only contain alphabet" });
    if (!isValidBody(email)) return res.status(400).send({ status: false, message: "email is required" });

    email = checkSpaceBtwWord(email);
    if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "please provide valid email" });

    if (!isValidBody(phone)) return res.status(400).send({ status: false, message: "phone is required" });

    phone = checkSpaceBtwWord(phone);
    if (!isValidphone(phone)) return res.status(400).send({ status: false, message: "please provide valid indian phone number", });

    if (!password) return res.status(400).send({ status: false, message: "password is required" });
    if (!isValidpassword(password)) return res.status(400).send({ status: false, message: "please provide valid password and password must contains minimum 8 characters and maximum 15 characters" });

    let pwd = await bcrypt.hash(password, 10);// it is used to hashing the password

    const checkEmailAndPhone = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] });
    if (checkEmailAndPhone) {
      if (checkEmailAndPhone.email == email) return res.status(400).send({ status: false, message: "email is already exits" });
      if (checkEmailAndPhone.phone == phone) return res.status(400).send({ status: false, message: "phone is already exits" });
    }

    let newAddress = JSON.parse(address);

    let { shipping, billing } = newAddress;

    if (!isValidBody(shipping.street)) return res.status(400).send({ status: false, message: "Please provide street name in your shipping address." });

    if (!isValidBody(shipping.city)) return res.status(400).send({
      status: false, message: "Please provide city name in your shipping address"
    });
    if (!isValidCity(shipping.city)) return res.status(400).send({ status: false, message: "Invalid shipping city" });
    shipping.city = checkSpaceBtwWord(shipping.city);

    if (!isValidBody(shipping.pincode)) return res.status(400).send({ status: false, message: "Please provide pincode in your shipping address.." });
    if (!isValidPinCode(shipping.pincode)) return res.status(400).send({ status: false, message: "Invalid Shipping pincode" });

    if (!isValidBody(billing.street)) return res.status(400).send({ status: false, message: "Please provide strret name in your billing address." });

    if (!isValidBody(billing.city)) return res.status(400).send({ status: false, message: "Please provide city name in your billing address.." });
    if (!isValidCity(billing.city)) return res.status(400).send({ status: false, message: "Invalid Billing city" });

    billing.city = checkSpaceBtwWord(billing.city);

    if (!isValidBody(billing.pincode)) return res.status(400).send({ status: false, message: "Please provide pincode in your billing address.." });
    if (!isValidPinCode(billing.pincode)) return res.status(400).send({ status: false, message: "Invalid Billing pincode" });

    if (typeof newAddress !== "object") return res.status(400).send({ status: false, message: "Address must be in object" });

    let userData = { fname, lname, email, phone, password: pwd, address: newAddress, profileImage: uploadUrl };

    let saveData = await userModel.create(userData);

    return res.status(201).send({ status: true, message: "User created successfully", data: saveData });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!email) return res.status(400).send({ status: false, message: "email is required" });
    if (!password) return res.status(400).send({ status: false, message: "password is required" });

    let findCredential = await userModel.findOne({ email: email });

    if (!findCredential) return res.status(400).send({ status: false, message: "email is incorrect" });
    let checkPass = await bcrypt.compare(password, findCredential.password);
    if (!checkPass) return res.status(400).send({ status: false, message: "password is incorrect" });

    let user = findCredential._id; // use bcrypt

    let token = jwt.sign({ userId: user, }, "Project-5-productsManagement", { expiresIn: "1h" });
    //res.bearerToken
    return res.status(200).send({ status: true, message: "User login successfull", data: { userId: user, token: token } });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//get userDetails by params
exports.getUser = async (req, res) => {
  try {
    let userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is not valid" });

    let getData = await userModel.findById({ _id: userId });

    if (!getData) return res.status(404).send({ status: false, message: `data not found with this ID ${userId}` });

    res.status(200).send({ status: true, message: "User profile details", data: getData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// UPDATE USER DETAILS

// exports.updateUser = async (req, res) => {
//   try {
//     let userId = req.params.userId;
//     let data = req.body;
//     let files = req.files;

//     if (files && files.length > 0) {
//       data.profileImage = await upload.uploadFile(files[0]);
//     }
//     let { fname, lname, email, phone, password, address } = data;

//     if (Object.keys(data).length == 0)
//       return res.status(400).send({ status: false, message: "please provide data for update" });

//     if (fname) {
//       if (!isValidName(fname)) return res.status(400).send({ status: false, message: "please provide valid first name", });
//       fname = checkSpaceBtwWord(fname);
//       fname = fname.trim();
//     }
//     if (lname) {
//       if (!isValidName(lname)) return res.status(400).send({ status: false, message: "please provide valid last name" });
//       lname = checkSpaceBtwWord(lname);
//       lname = lname.trim();
//     }
//     if (email) {
//       if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "please provide valid email" });
//       email = checkSpaceBtwWord(email);
//       email = email.trim();
//     }
//     if (phone) {
//       if (!isValidphone(phone)) return res.status(400).send({ status: false, message: "please provide valid indian phone number" });
//       phone = checkSpaceBtwWord(phone);
//       phone = phone.trim();
//     }
//     if (password) {
//       if (!isValidpassword(password)) return res.status(400).send({
//         status: false, message: "please provide valid password and password must contains minimum 8 characters and maximum 15 characters",
//       });
//     }

//     address = JSON.parse(address)

//     if (typeof address !== "object")
//       return res.status(400).send({ status: false, message: "Address must be in object" });
//     let { shipping, billing } = address;

    
//       if (!isValidCity(shipping?.city)) return res.status(400).send({ status: false, message: "Invalid shipping city" });
//       if (!isValidPinCode(shipping?.pincode)) return res.status(400).send({ status: false, message: "Invalid Shipping pincode" });
    

    
//       if (!isValidCity(billing?.city)) return res.status(400).send({ status: false, message: "Invalid Billing city" });
//       if (!isValidPinCode(billing?.pincode)) return res.status(400).send({ status: false, message: "Invalid Billing pincode" });
    
//     let oldUserData = await userModel.findById(userId)

//     let dataToBeUpdate = {
//       fname: fname,
//       lname: lname,
//       email: email,
//       phone: phone,
//       password: password,
//       profileImage: data.profileImage,
//       address: {
//         shipping: {
//           street: shipping?.street || oldUserData.address.shipping.street,
//           city: shipping?.city || oldUserData.address.shipping.city,
//           pincode: shipping?.pincode || oldUserData.address.shipping.pincode,
//         },
//         billing: {
//           street: billing?.street || oldUserData.address.billing.street,
//           city: billing?.city || oldUserData.address.billing.city,
//           pincode: billing?.pincode || oldUserData.address.billing.pincode,
//         },
//       },
//     };

//     const updateData = await userModel.findByIdAndUpdate({ _id: userId }, dataToBeUpdate, { new: true });

//     return res.status(200).send({ status: false, message: "User profile updated", data: updateData });
    
//   } catch (error) {
//     res.status(500).send({ status: false, message: error.message });
//   }
// };


exports.updateUser = async function(req,res){
  try{
        let userId = req.params.userId;
    let data = req.body;
    let files = req.files;

    if (files && files.length > 0) {
      data.profileImage = await upload.uploadFile(files[0]);
    }
    let { fname, lname, email, phone, password, address } = data;

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "body cant be empty" });

      if(fname){
          if(!isValidName(fname)) return res.status(400).send({status:false,message:"please provide valid fname"})
      }
      if(lname){
          if(!isValidName(lname)) return res.status(400).send({status:false,message:"please provide valid lname"})
      }
      if(email) {
          if(!isValidEmail(email)) return res.status(400).send({status:false,message:"please provide valid email"})
      }
      if(password){
          if(!isValidpassword(password))  return res.status(400).send({status:false,message:"please provide valid password"})
          body.password=await bcrypt.hash(password,10) 
      }
      if(phone){
          if(!isValidphone(phone)) return res.status(400).send({status:false,message:"Please provide valid phone number"})
      }
     
      if(address){
  try {
      if(typeof req.body.address !== 'object') 
      address = JSON.parse(address)
      console.log(address);

  } catch (err) {
    return res.status(400).send({status:false,message:"Enter Valid JSON Address !"})
  }
      
      if(address?.shipping){
          if(!isValidCity(address.shipping.city)){
              return res.status(400).send({status:false,message:"Please provide valid city"})
          }
          
          // if(!isValidPinCode(address.shipping.pincode)){
          //     return res.status(400).send({status:false,message:"please provide valid pincode"})
          // }
      }
      if(address?.billing){
          if(!isValidCity(address.billing.city)){
              return res.status(400).send({status:false,message:"Please provide valid city"})
          }
          // if(!isValidPinCode(address.billing.pincode)){
          //     return res.status(400).send({status:false,message:"please provide valid pincode"})
          // }
      }}

          let oldUserData = await userModel.findById(userId)
      
     let dataToBeUpdate = {
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      password: password,
      profileImage: data.profileImage,
      address: {
        shipping: {
          street: address?.shipping?.street || oldUserData.address.shipping.street,
          city: address?.shipping?.city || oldUserData.address.shipping.city,
          pincode: address?.shipping?.pincode || oldUserData.address.shipping.pincode,
        },
        billing: {
          street: address?.billing?.street || oldUserData.address.billing.street,
          city: address?.billing?.city || oldUserData.address.billing.city,
          pincode: address?.billing?.pincode || oldUserData.address.billing.pincode,
        },
      },
    };

    const updateData = await userModel.findByIdAndUpdate({ _id: userId }, dataToBeUpdate, { new: true });

    return res.status(200).send({ status: false, message: "User profile updated", data: updateData });

  } catch(err){
      return res.status(500).send({status:false,message:err.message})
  }
}
