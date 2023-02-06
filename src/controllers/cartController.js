const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const mongoose = require("mongoose")


// ------create-cart------
exports.createCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let { productId, cartId, quantity } = data;
        if (!quantity) {
            quantity = 1
        }
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send(({ status: false, message: "Please provide valid product Id" }))

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send(({ status: false, message: "Please provide valid user Id" }))
        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) {
            return res.status(404).send({ status: false, message: "productId is not found" })
        }
        let price = productData.price

        // let cartData = await cartModel.findOne({ userId: userId, _id:cartId })

        let cartData = await cartModel.findOne({ userId: userId, _id:cartId })

        if (!cartData) {

            let data = {
                userId: userId,
                items: [{ productId: productId, quantity: quantity }],
                totalPrice: (price * quantity),
                totalItems: 1,
            }

            let checkId = await cartModel.findOne({userId:userId})

            if(checkId) return res.status(400).send({ status: false, message: "plz provide cartid" })

            let createCart = await cartModel.create(data)
            return res.status(201).send({ status: true, message: "Success", data: createCart })
          }

        else {
            let items = cartData.items
            let totalPrice = cartData.totalPrice
            let totalItems = cartData.totalItems


            let flag = 0;
            // let NewQuantity = 0;

            for (let i = 0; i < items.length; i++) {
                if (items[i].productId == productId) {
                    items[i].quantity += quantity
                    // NewQuantity = items[i].quantity
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



