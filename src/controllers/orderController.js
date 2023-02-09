const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const { isValidObjectId } = require("mongoose")

// const {isValidObjectId,isValidRequestBody}=require('../validator/validator')


exports.createOrder = async (req, res) => {
  try {
    //request userId from path params
    const userId = req.params.userId
    // Destructuring
    let data = req.body
    let { cartId, status, cancellable } = data
    //request body must not be empty

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: " Body  can't be Empty!!!" })
    //cartId validation => cartId is mandatory and must not be empty
    if (!cartId) return res.status(400).send({ status: false, message: "Please provide cartId !!!" });
    //cartId must be a valid objectId
    if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId!" });

    //DB call => find cart details from cartModel by userId and cartId
    const cartItems = await cartModel.findOne({ _id: cartId, userId: userId, isDeleted: false })
    //userId not present in the DB
    //if (cartItems.userId != userId) return res.status(404).send({ status: false, message: `${userId} is not present in the DB!` });
    // cart not present in the DB or empty
    if (!cartItems) return res.status(400).send({ status: false, message: "Either cart is empty or does not exist!" });

    //products quantity update
    let items = cartItems.items
    let totalQuantity = 0
    
    for (let i = 0; i < items.length; i++) {
      totalQuantity += items[i].quantity
    }

    if (items == 0) return res.status(400).send({ status: false, message: "there is no items left for Order !!!" });

    // cancellable validation => if key is present value must not be empty
    if (cancellable) {
      //cancellable must be true or false
      if (cancellable !== true || false) {
        return res.status(400).send({ status: false, message: "Cancellable can be either true or false!" });
      }
    }

    // status validation => if key is present value must not be empty
    if (status) {
      //status must be pending or completed or canceled
      if (status !== "pending" || "completed" || "cancelled") {
        return res.status(400).send({ status: false, message: "Status can be either pending or completed or cancelled!" });
      }
    }



    // Destructuring
    let order = { userId: userId, items: cartItems.items, totalPrice: cartItems.totalPrice, totalItems: cartItems.totalItems, totalQuantity: totalQuantity, cancellable: cancellable, status: status }

    //Create order for the user and store in DB
    let orderCreation = await orderModel.create(order)
    //update cart on successfully complition of order and set cart as empty
    await cartModel.findOneAndUpdate({ userId: userId, isDeleted: false }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
    //Successfull oreder details return response to body
    return res.status(201).send({ status: true, message: `Success`, data: orderCreation });
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

exports.updateOrder = async (req, res) => {
  try {

    let data = req.body

    let { orderId, status } = data

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide data in body !!!" })

    if (!orderId) {
      return res.status(400).send({ status: false, message: "OrderId is missing" })
    }

    if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Please provide valid orderId!" });
    
    // let checkOrderId = await orderModel.findOne({_id:orderId, cancellable : true})
    // if(!checkOrderId){return res.status(404).send({status:false, message:"order id is not found"})}
      
    let newStatus = {}
    if (status) {
      if (!(status == "completed" || status == "cancelled")) { // status == painding
        return res.status(400).send({ status: false, message: "status can be from enum only like [completed , cancelled ]" })
      }
      else {
        newStatus.status = status
      }
    }
    else {
      return res.status(400).send({ status: false, message: " Please take status in req body for update the product !!!" })
    }

    const orderCancel= await orderModel.findOneAndUpdate({ _id: orderId}, { $set: newStatus }, { new: true });
    
    //if(!orderCancel){return res.status(400).send({status:false, message:"this order  can't be cancelled"})}
    return res.status(200).send({ status: true, message: "Success", data: orderCancel });
  } catch (err) {
    return res.status(500).send({ message: err.message })
  }
}