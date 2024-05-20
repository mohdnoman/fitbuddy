import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {


    // get values from user
    const { name, email, password, age, gender, weight, height, fitnessGoals, dietaryPreferences } = req.body
    


    // validate values
    if (!name || !email || !password || !age || !gender || !weight || !height || !fitnessGoals || !dietaryPreferences) {
        throw new ApiError(400, "All fields are required")
    }


    // check if user already exists
    const existedUser = User.find({
        $or: [{ name }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exists!!!")
    }

    // check for image
    const profileLocalPath = req.files?.profile[0]?.path

    if (!profileLocalPath) {
        throw new ApiError(400, "Profile picture is required.")
    }

    // if image is given upload it to cloudinary
    const profile = await uploadOnCloudinary(profileLocalPath)

    if (!profile) {
        throw new ApiError(400, "Profile picture is required.")
    }


    //create new user in db
    const user = await User.create({
        name,
        email,
        password,
        age,
        gender,
        weight,
        height,
        fitnessGoals,
        dietaryPreferences,
        profile: profile.url || ""
    })

    //check if user is created
    // remove password and refreshtoken from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    //return res
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registerd successfully")
    )
})


export {
    registerUser,
}