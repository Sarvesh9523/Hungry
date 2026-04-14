const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const commentModel = require("../models/comment.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function getFoodItems(req, res) {
    const userId = req.user._id;
    const foodItems = await foodModel.find({});

    // Fetch all likes and saves for this user in one go
    const userLikes = await likeModel.find({ user: userId }).select('food');
    const userSaves = await saveModel.find({ user: userId }).select('food');

    const likedFoodIds = new Set(userLikes.map(l => l.food.toString()));
    const savedFoodIds = new Set(userSaves.map(s => s.food.toString()));

    // Annotate each food item with isLiked / isSaved for the current user
    const annotatedItems = foodItems.map(food => {
        const obj = food.toObject();
        obj.isLiked = likedFoodIds.has(food._id.toString());
        obj.isSaved = savedFoodIds.has(food._id.toString());
        return obj;
    });

    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems: annotatedItems
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully",
            isLiked: false
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like,
        isLiked: true
    })

}

async function getLikedFood(req, res) {
  try {
    const userId = req.user._id;

    // Fetch all likes by user and populate with food data
    const likedFoods = await likeModel.find({ user: userId }).populate("food");
    // Also check which of these foods are saved by the user
    const userSaves = await saveModel.find({ user: userId }).select('food');
    const savedFoodIds = new Set(userSaves.map(s => s.food.toString()));

    // Extract only valid food documents and annotate
    const foods = likedFoods
      .filter(like => like.food)
      .map(like => {
        const obj = like.food.toObject();
        obj.isLiked = true;
        obj.isSaved = savedFoodIds.has(like.food._id.toString());
        return obj;
      });

    res.status(200).json({
      success: true,
      foods
    });
  } catch (error) {
    console.error("Error fetching liked foods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch liked foods",
      error: error.message
    });
  }
}


async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully",
            isSaved: false
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save,
        isSaved: true
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    // Also check which of these foods are liked by the user
    const userLikes = await likeModel.find({ user: user._id }).select('food');
    const likedFoodIds = new Set(userLikes.map(l => l.food.toString()));

    // Annotate each saved food with isLiked / isSaved
    const annotatedSavedFoods = savedFoods.map(item => {
        const obj = item.toObject();
        if (obj.food) {
            obj.food.isLiked = likedFoodIds.has(obj.food._id.toString());
            obj.food.isSaved = true;
        }
        return obj;
    });

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods: annotatedSavedFoods
    });

}


async function shareFood(req, res) {
    const { foodId } = req.body;
    try {
        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { sharesCount: 1 }
        });
        res.status(200).json({ success: true, message: "Food shared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to share food" });
    }
}

async function addComment(req, res) {
    const { foodId, text } = req.body;
    const user = req.user;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    try {
        const comment = await commentModel.create({
            user: user._id,
            food: foodId,
            text: text.trim()
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { commentsCount: 1 }
        });

        // Populate user details before returning
        await comment.populate('user', 'name profilePic');

        res.status(201).json({ success: true, message: "Comment added", comment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add comment", error: error.message });
    }
}

async function getComments(req, res) {
    const { foodId } = req.params;

    try {
        const comments = await commentModel.find({ food: foodId })
            .populate('user', 'name profilePic username email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch comments", error: error.message });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    getLikedFood,
    saveFood,
    getSaveFood,
    shareFood,
    addComment,
    getComments
}