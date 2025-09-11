const userModel = require("../models/user.model")
const foodPartnerModel = require("../models/foodpartner.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {

    const { fullName, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        email
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullName,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({
        id: user._id,
        role: "user"
    }, process.env.JWT_SECRET)

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,         // true on HTTPS (production)
        sameSite: 'None',     // must be 'None' if frontend and backend are on different domains
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });


    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })

}

async function loginUser(req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email
    })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: user._id,
        role: "user"
    }, process.env.JWT_SECRET)

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,         // true on HTTPS (production)
        sameSite: 'None',     // must be 'None' if frontend and backend are on different domains
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });


    res.status(200).json({
        message: "User logged in successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}

function logoutUser(req, res) {
    res.clearCookie("token");
    res.status(200).json({
        message: "User logged out successfully"
    });
}


async function registerFoodPartner(req, res) {

    const { name, email, password, phone, address, contactName } = req.body;

    const isAccountAlreadyExists = await foodPartnerModel.findOne({
        email
    })

    if (isAccountAlreadyExists) {
        return res.status(400).json({
            message: "Food partner account already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const foodPartner = await foodPartnerModel.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        contactName
    })

    const token = jwt.sign({
        id: foodPartner._id,
        role: "foodPartner"
    }, process.env.JWT_SECRET)

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,         // true on HTTPS (production)
        sameSite: 'None',     // must be 'None' if frontend and backend are on different domains
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });


    res.status(201).json({
        message: "Food partner registered successfully",
        foodPartner: {
            _id: foodPartner._id,
            email: foodPartner.email,
            name: foodPartner.name,
            address: foodPartner.address,
            contactName: foodPartner.contactName,
            phone: foodPartner.phone
        }
    })

}

async function loginFoodPartner(req, res) {

    const { email, password } = req.body;

    const foodPartner = await foodPartnerModel.findOne({
        email
    })

    if (!foodPartner) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: foodPartner._id,
        role: "foodPartner"

    }, process.env.JWT_SECRET)

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,         // true on HTTPS (production)
        sameSite: 'None',     // must be 'None' if frontend and backend are on different domains
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });


    res.status(200).json({
        message: "Food partner logged in successfully",
        foodPartner: {
            _id: foodPartner._id,
            email: foodPartner.email,
            name: foodPartner.name
        }
    })
}

function logoutFoodPartner(req, res) {
    res.clearCookie("token");
    res.status(200).json({
        message: "Food partner logged out successfully"
    });
}


// auth.controller for deciding the profile role on reelfeed
async function getMe(req, res) {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let profile;
        if (decoded.role === "user") {
            profile = await userModel.findById(decoded.id).select("-password");
        } else if (decoded.role === "foodPartner") {
            profile = await foodPartnerModel.findById(decoded.id).select("-password");
        }

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        res.json({ role: decoded.role, profile });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ Now this will have value from middleware
        const { nickname, avatar } = req.body;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { nickname, avatar },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ message: error.message });
    }
};






module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    getMe,
    updateProfile
}