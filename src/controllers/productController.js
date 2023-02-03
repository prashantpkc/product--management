let{isValidObjectId} = require("mongoose");
const productModel = require("../models/productModel");
const upload = require("../aws/aws");

const {
  isValidProductName,
  isValidPrice,
  isValidInstallments,
  isValidBody,
  isValidName,
  isValidateSize
} = require("../validator/validator");

module.exports.createProduct = async (req, res) => {
  try {
    let data = req.body;

    if (!Object.keys(data).length)
      return res
        .status(400)
        .send({
          status: false,
          message: "please provide details for create product",
        });

    let {
      installments,
      availableSizes,
      isFreeShipping,
      currencyFormat,
      currencyId,
      price,
      description,
      title,
      style,
    } = data;

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

    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "title is required" });
    if (!isValidProductName(title))
      return res
        .status(400)
        .send({ status: false, message: "please provide valid product name" });
    else {
      title = title.trim();
    }

    if (!description)
      return res
        .status(400)
        .send({ status: false, message: "description is required" });

    if (!price)
      return res
        .status(400)
        .send({ status: false, message: "price is required" });
    if (!isValidPrice(price))
      return res
        .status(400)
        .send({ status: false, message: "please provide valid price" });
    else {
      price = price.trim();
    }

    if (!availableSizes)
      return res
        .status(400)
        .send({ status: false, message: "availableSizes is required" });

    if (availableSizes) {
      availableSizes = availableSizes
        .split(",")
        .map((size) => size.trim().toUpperCase());
      for (let i = 0; i < availableSizes.length; i++) {
        if (
          !["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])
        )
          return res
            .status(400)
            .send({
              status: false,
              message: "size can contain only S, XS,M, X, L, XXL, XL",
            });
      }
    }
    
    if (!currencyFormat)
      return res
        .status(400)
        .send({ status: false, message: "currencyFormat is required" });

    if (currencyFormat != "₹")
      return res
        .status(400)
        .send({ status: false, message: "currency format should be ₹" });

    if (!currencyId)
      return res
        .status(400)
        .send({ status: false, message: "currencyId is required" });

    if (installments) {
      if (!isValidInstallments(installments))
        return res
          .status(400)
          .send({
            status: false,
            message: "Installment must be an integer",
          });
    }

    const isTitleExist = await productModel.findOne({ title: title });

    if (isTitleExist)
      return res
        .status(400)
        .send({ status: false, message: "title is already registered" });

    let productData = {
      title,
      description,
      price,
      availableSizes,
      installments,
      currencyFormat,
      style,
      currencyId,
      isFreeShipping,
      productImage: uploadUrl,
    };

    const createProduct = await productModel.create(productData);

    return res
      .status(201)
      .send({ status: false, message: "Success", data: createProduct });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};

//===============================getProduct===================================================================//

// Returns all products in the collection that aren't deleted.
// Filters
// Size (The key for this filter will be 'size')
// Product name (The key for this filter will be 'name'). You should return all the products with name containing the substring recieved in this filter
// Price : greater than or less than a specific value. The keys are 'priceGreaterThan' and 'priceLessThan'.
// NOTE: For price filter request could contain both or any one of the keys. For example the query in the request could look like { priceGreaterThan: 500, priceLessThan: 2000 } or just { priceLessThan: 1000 } )

// Sort
// Sorted by product price in ascending or descending. The key value pair will look like {priceSort : 1} or {priceSort : -1} eg /products?size=XL&name=Nit%20grit
// Response format
// On success - Return HTTP status 200. Also return the product documents. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.getProduct = async function (req, res) {

    try {
        let data = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data

        let obj = { isDeleted: false }

        if (size) {
            if (!isValidBody(size)) return res.status(400).send({ status: false, message: "Please enter Size" });
            if(!isValidateSize(size))return res.status(400).send({ status: false, message: "only use[S, XS, M, X, L, XXL, XL]" })
            obj.availableSizes = size
        }

        if (name) {
            if (!isValidBody(name)) { return res.status(400).send({ status: false, message: "Please enter name" }) }
            if (!isValidName(name)) { return res.status(400).send({ status: false, message: "Please mention valid name" }) }
            obj.title = name
        }

        if (priceGreaterThan) {
            if (!isValidBody(priceGreaterThan)) return res.status(400).send({ status: false, message: "Please enter Price Greater Than" });
            if (!isValidPrice(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be number" });
            obj.price = { $gt: priceGreaterThan }
        }

        if (priceLessThan) {
            if (!isValidBody(priceLessThan)) return res.status(400).send({ status: false, message: "Please enter Price Lesser Than" });
            if (!isValidPrice(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be number" });
            obj.price = { $lt: priceLessThan }
        }

        if (priceGreaterThan && priceLessThan) {
            obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

        if (priceSort) {
            if (!(priceSort == -1 || priceSort == 1)) return res.status(400).send({ status: false, message: "Please Enter '1' for Sort in Ascending Order or '-1' for Sort in Descending Order" });
        }

        let getProduct = await productModel.find(obj).sort({ price: priceSort })

        if (getProduct.length == 0) return res.status(404).send({ status: false, message: "Product Not Found." })

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

// ## GET /products/:productId
// Returns product details by product id
// Response format
// On success - Return HTTP status 200. Also return the product documents. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like th

module.exports.getProductById = async(req,res)=>{
	try {
		let productId = req.params.productId
		if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

		let data = await productModel.findOne({_id:productId},{isDeleted:false})
		if(!data) return res.status(400).send({ status: false, message: "product not found" })

		return res.status(200).send({ status: true, message: "Success", data: data })		
		
	} catch (error) {
		return res.status(500).send({ status: false, message: error.message })
	}
}

