const express = require('express');
const authController = require("../controllers/auth.controller")
const { authUserMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// User auth OTP APIs
router.post('/user/login/send-otp', authController.sendUserLoginOTP);
router.post('/user/login/verify-otp', authController.verifyUserLoginOTP);
router.post('/user/register/send-otp', authController.sendUserRegisterOTP);
router.post('/user/register/verify-otp', authController.verifyUserRegisterOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/user/forgot-password', authController.forgotPassword);
router.post('/user/reset-password', authController.resetPassword);

// Food partner auth APIs
router.post('/food-partner/register', authController.registerFoodPartner);
router.post('/food-partner/login', authController.loginFoodPartner);
router.get('/food-partner/logout', authController.logoutFoodPartner);

// JWT Rotation & User Management
router.post('/refresh', authController.refreshToken);
router.get('/user/logout', authController.logoutUser);

// Profiles
router.get("/me", authController.getMe);
router.put("/profile", authUserMiddleware, authController.updateProfile);

module.exports = router;