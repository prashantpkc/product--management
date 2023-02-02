const express = require("express")
const router = express.Router()

const {createUser,login,getUser} = require("../controllers/userController")

router.post("/register", createUser )
router.post("/login" , login)
router.get("/user/:userId/profile", getUser)

module.exports = router