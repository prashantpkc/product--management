const express = require("express")
const router = express.Router()

const {createUser,login,getUser,updateUser} = require("../controllers/userController")
const {createProduct,getProduct} = require("../controllers/productController")
const{authenticate,authorize} = require("../middleWare/auth")

router.post("/register", createUser )
router.post("/login" , login)
router.get("/user/:userId/profile",authenticate, getUser)
router.put("/user/:userId/profile",authenticate,authorize, updateUser)

//Product API

router.post("/products", createProduct )
router.get("/products", getProduct )


module.exports = router