const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Helper to get token from cookie or Authorization header
function getToken(req) {
    return req.cookies.token || req.headers.authorization?.split(" ")[1];
}

// Food Partner Middleware
async function authFoodPartnerMiddleware(req, res, next) {
    const token = getToken(req);

    if (!token) return res.status(401).json({ message: "Please login first" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const foodPartner = await foodPartnerModel.findById(decoded.id);
        req.foodPartner = foodPartner;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

// User Middleware
async function authUserMiddleware(req, res, next) {
    const token = getToken(req);

    if (!token) return res.status(401).json({ message: "Please login first" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware
};
