const express = require("express")
const router = express.Router()

const { createUser, login, getUser, updateUser } = require("../controllers/userController")
const { createProduct, getProduct, getProductById, updateProductDetails, deleteProducts } = require("../controllers/productController")
const { createCart, updateCart, getCart, deleteCart } = require("../controllers/cartController")
const { authenticate, authorize } = require("../middleWare/auth")

//      USER API

router.post("/register", createUser)
router.post("/login", login)
router.get("/user/:userId/profile", authenticate, getUser)
router.put("/user/:userId/profile", authenticate, authorize, updateUser)

//Product API

router.post("/products", createProduct)
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId", updateProductDetails)
router.delete("/products/:productId", deleteProducts)

//Cart API

router.post("/users/:userId/cart", authenticate, authorize, createCart)
router.put("/users/:userId/cart", authenticate, authorize, updateCart)
router.get("/users/:userId/cart", authenticate, authorize, getCart)
router.delete("/users/:userId/cart", authenticate, authorize, deleteCart)





router.all("/*", (req, res) => {
    res.status(400).send({ status: false, message: "HTTP path invalid" })
})


module.exports = router