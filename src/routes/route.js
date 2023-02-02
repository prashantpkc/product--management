const express = require("express")
const router = express.Router()

const {createUser,login,getUser,updateUser} = require("../controllers/userController")

router.post("/register", createUser )
router.post("/login" , login)
router.get("/user/:userId/profile", getUser)
router.put("/user/:userId/profile", updateUser)

module.exports = router