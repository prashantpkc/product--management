// ## POST /products
// Create a product document from request body.
// Upload product image to S3 bucket and save image public url in document.
// Response format
// On success - Return HTTP status 201. Also return the product document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

const mongoose = require('mongoose')
const productModel= require("../models/productModel")

module.exports.createProduct = async(req,res)=>{

   try {
	 let data = req.body
	
	    if(!Object.keys(data).length) return res.status(400).send({status:false, message:"please provide details for create product"}, )
	
	    let {installments,availableSizes,productImage,isFreeShipping,currencyFormat,currencyId,price,description,title} = data
	
	    let files = req.files
	
	    if(!title) return res.status(400).send({status:false,message:"title is required"})
	    
	    if(!description) return res.status(400).send({status:false,message:"description is required"})
	    
	    if(!price) return res.status(400).send({status:false,message:"price is required"})
	
	    if(!availableSizes) return res.status(400).send({status:false,message:"availableSizes is required"})
	    
	    if(!productImage) return res.status(400).send({status:false,message:"productImage is required"})
	    
	    if(!currencyFormat) return res.status(400).send({status:false,message:"currencyFormat is required"})
	
	    if(currencyFormat != "₹") return res.status(400).send({status:false,message:"currency format should be ₹"})
	
	    
	    if(!currencyId) return res.status(400).send({status:false,message:"currencyId is required"})
	
	
	    
	    if(!title) return res.status(400).send({status:false,message:"title is required"})
	
	
	    const createProduct = await productModel.create(data)
	
	    return res.status(201).send({status:false, message:"Success", data:createProduct})
} catch (error) {
    res.status(500).send({status:false, message:error.message})
}
}