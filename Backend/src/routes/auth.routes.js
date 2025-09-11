const express = require('express');
const authController = require("../controllers/auth.controller")
const { authUserMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// user auth APIs
router.post('/user/register', authController.registerUser)
router.post('/user/login', authController.loginUser)
router.get('/user/logout', authController.logoutUser)



// food partner auth APIs
router.post('/food-partner/register', authController.registerFoodPartner)
router.post('/food-partner/login', authController.loginFoodPartner)
router.get('/food-partner/logout', authController.logoutFoodPartner)

//for profile role
router.get("/me", authController.getMe);

//for update profile
router.put("/profile",authUserMiddleware, authController.updateProfile);





module.exports = router;