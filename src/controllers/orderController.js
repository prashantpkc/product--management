const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const { isValidObjectId } = require("mongoose")

//======================================CREATE ORDER=====================

exports.createOrder = async (req, res) => {
  try {

    let  userId = req.params.userId

    let data = req.body
    let { cartId, status, cancellable } = data

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: " Body  can't be Empty!!!" })

    if (!cartId) return res.status(400).send({ status: false, message: "Please provide cartId !!!" });

    if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId!" });

    let cartItems = await cartModel.findOne({ _id: cartId, userId: userId, isDeleted: false })
    if (!cartItems) return res.status(400).send({ status: false, message: "Either cart is empty or does not exist!" });

    let items = cartItems.items
    let totalQuantity = 0
    
    for (let i = 0; i < items.length; i++) {
      totalQuantity += items[i].quantity
    }

    if (items == 0) return res.status(400).send({ status: false, message: "there is no items left for Order !!!" });

    if (cancellable) {
      if (cancellable !== true || false) {
        return res.status(400).send({ status: false, message: "Cancellable can be either true or false!" });
      }
    }

    if (status) {
      if (status !== "pending" || "completed" || "cancelled") {
        return res.status(400).send({ status: false, message: "Status can be either pending or completed or cancelled!" });
      }
    }

    let order = { userId: userId, items: cartItems.items, totalPrice: cartItems.totalPrice, totalItems: cartItems.totalItems, totalQuantity: totalQuantity, cancellable: cancellable, status: status }

    let orderCreation = await orderModel.create(order)
    await cartModel.findOneAndUpdate({ userId: userId, isDeleted: false }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
    return res.status(201).send({ status: true, message: `Success`, data: orderCreation });
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

//=======================================UPDATE ORDER===================

exports.updateOrder = async (req, res) => {
  try {
     let userId = req.params.userId
    let data = req.body

    let { orderId, status } = data

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide data in body !!!" })

    if (!orderId) {
      return res.status(400).send({ status: false, message: "OrderId is missing" })
    }
    if(!status){return res.status(400).send({ status: false, message: "status is missing" })}

    if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Please provide valid orderId!" });
    
     let checkOrderId = await orderModel.findOne({_id:orderId,userId:userId})
     if(!checkOrderId){return res.status(404).send({status:false, message:"order id is not found"})}
    
     if(checkOrderId.status=="cancelled")return res.status(400).send({status:false , message:"this order is already cancelled"})
    
     if(checkOrderId.status=="completed")return res.status(400).send({status:false , message:"this order is already completed"})
   

     if(checkOrderId.cancellable == false && status == "cancelled"){return res.status(400).send({ status: false, message: "This order cannot be cancelled" })}
    
    if (status) {
      if (!(status == "completed" || status == "cancelled")) { 
        return res.status(400).send({ status: false, message: "status can be from enum only like [completed , cancelled ]" })
      }
      else {
        checkOrderId.status = status
        checkOrderId.cancellable = false
      }
    }
    else {
      return res.status(400).send({ status: false, message: " Please take status in req body for update the product !!!" })
    }

    let orderCancel= await orderModel.findOneAndUpdate({ _id: orderId }, { $set: checkOrderId }, { new: true });
    
    return res.status(200).send({ status: true, message: "Success", data: orderCancel });
  } catch (err) {
    return res.status(500).send({ status:false , message: err.message })
  }
}