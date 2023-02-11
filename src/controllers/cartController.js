const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const {isValidObjectId} = require("mongoose")


// =================================== CREATE CART===========================
exports.createCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let { productId, cartId, quantity } = data;
        if (!quantity) {
            quantity = 1
        }
        if (!isValidObjectId(productId)) return res.status(400).send(({ status: false, message: "Please provide valid product Id" }))

        if (!isValidObjectId(userId)) return res.status(400).send(({ status: false, message: "Please provide valid user Id" }))
        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) {
            return res.status(404).send({ status: false, message: "productId is not found" })
        }
        
        let price = productData.price

        let cartData = await cartModel.findOne({ userId: userId, _id:cartId })

        if (!cartData) {

            let data = {
                userId: userId,
                items: [{ productId: productId, quantity: quantity }],
                totalPrice: (price * quantity),
                totalItems: 1,
            }

            let  check = await cartModel.findOne({userId:userId,_id: cartId})
            if(check) return res.status(400).send({status:false, message:"pls provide valid cartid"})

            let createCart = await cartModel.create(data)

            return res.status(201).send({status:true, message:"Success", data:createCart})
        }

        else {
            let items = cartData.items
            let totalPrice = cartData.totalPrice
            let totalItems = cartData.totalItems

            let flag = 0;

            for (let i = 0; i < items.length; i++) {
                if (items[i].productId == productId) {
                    items[i].quantity += quantity
                    flag = 1
                }
            }

            if (flag == 1) {
                price = (quantity * price) + totalPrice
                let data = {
                    totalPrice: price,
                    items: items,
                    totalItems: items.length
                }
                let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: data }, { new: true })
                return res.status(201).send({ status: true, message: "Success", data: updateCart })
            } else if (flag == 0) {
                items.push({ productId: productId, quantity: quantity })
                price = (price * quantity) + totalPrice
                totalItems = totalItems + 1
                let data = {
                    items: items,
                    totalPrice: price.toFixed(2),
                    totalItems: totalItems

                }
                let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: data }, { new: true })
                return res.status(201).send({ status: true, message: "Success", data: updateCart })

            }
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// ============================= UPDATE CART===============================

exports.updateCart = async function (req, res) {
    try {
       let data = req.body;
       let userId = req.params.userId
  
       let { cartId, productId, removeProduct } = data
      
       let findUser = await userModel.findById({ _id: userId })
       if (!findUser) return res.status(404).send({ status: false, message: "User not found" })
       
       if (!cartId) return res.status(400).send({ status: false, message: "please enter your cartId" })
       if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "card Id is invalid" })
       
       const findCart = await cartModel.findOne({ _id: cartId })
       if (!findCart) return res.status(404).send({ status: false, message: "Cart id not found" })
  
       if (!productId) return res.status(400).send({ status: false, message: "please enter your productId" })
       if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "product Id is invalid" })

       const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
       if (!findProduct) return res.status(404).send({ status: false, message: "product not found" })
  
       if (![0, 1].includes(removeProduct)) return res.status(400).send({ status: false, message: "Remove product value should be  only in 0 or 1 " })
  
       for (let i = 0; i < findCart.items.length; i++) {
   
           if (findProduct._id.toString() == findCart.items[i].productId.toString()) {
               if (removeProduct == 1 && findCart.items[i].quantity > 1) {
                   let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { "items.$.quantity": -1, totalPrice: -(findProduct.price) } }, { new: true }).select({ __v: 0, "items._id": 0 })
                   return res.status(200).send({ status: true, message: "cart updated successfully", data: updateCart })
               } else {
                   let updateCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -(findProduct.price * (findCart.items[i].quantity)) } }, { new: true }).select({ __v: 0, "items._id": 0 })
                   return res.status(200).send({ status: true, message: "removed successfully", data: updateCart })
                }
           }
       } return res.status(404).send({ status: false, message: "product not found with cartId" })
  
   } catch (err) {
       return res.status(500).send({ status: false, message: err.message })
   }
  }
  
  // ================================GET CART==========================////

  exports.getCart= async function(req,res){
    try{
        const userId=req.params.userId;
  
        if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
    
        const userData = await cartModel.find({userId:userId})
        if(!userData) return res.status(404).send({status:false, message:"user not found"})
  
          return res.status(200).send({status:true, message:"Success",data:userData})
      }
  catch(err){      
         return res.status(500).send({status:false,message:err.message})
     }
  }
  
  // ====================DELETE CART
  exports.deleteCart= async function(req,res){
    try{
        const userId=req.params.userId;
       
        if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
          
        const updateData = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 }}, { new: true })
  
        if(!updateData) return res.status(404).send({status:false, message:"user not exist"})
  
        return res.status(204).send()
    }
  catch(err){     
            return res.status(500).send({status:false,message:err.message})
   }
  
  }   



