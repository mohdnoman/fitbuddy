import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, removeFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {


    // get values from user
    const { name, email, password, age, gender, weight, height, fitnessGoals, dietaryPreferences } = req.body
    


    // validate values
    if (!name || !email || !password || !age || !gender || !weight || !height || !fitnessGoals || !dietaryPreferences) {
        throw new ApiError(400, "All fields are required")
    }


    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ name }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exists!!!")
    }
    console.log("req.files:- ", req.file.path)
    // check for image
    const profileLocalPath =  req.file.path

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
        profile: profile.url
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

const loginUser = asyncHandler(async (req, res) => {

    // get username and password from user
    const { name, password } = req.body


    // check for given values 
    if (!name || !password) {
        throw new ApiError(400, "username and password are required")
    }


    // find the user
    const user = await User.findOne({ name })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }


    // password check 
    const isPasswordValid = await user.isPasswordCorrect(`${password}`)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credantials.")
    }


    // generate access token and refresh token
    const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(user._id)


    // send cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken, accessToken,
            },
            "user logged in successfully"
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
    // remove refresh token from user 
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    // remove token from cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options).json(
            new ApiResponse(200, {}, "User logged out successfully")
        )



})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?.userId).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
            new ApiResponse(200,
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400, "Invalid old password")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {},
        "password changed successfully"
    ))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "user fetched successfully"))
})

const updateUserProfile = asyncHandler(async (req, res) => {

    const profileLocalPath = req.file.path
    const prevProfileLink = req.user?.profile

    if (!profileLocalPath) {
        throw new ApiError(400, "Profile picture is required")
    }

    const profile = await uploadOnCloudinary(profileLocalPath)

    if (!profile.url) {
        throw new ApiError(400, "Error while fetching profile url from cloudinary.")
    }

    await removeFromCloudinary(prevProfileLink)

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                profile: profile.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "profile updated successfully"))


})

const updateUserInfo = asyncHandler(async (req, res) => {
    const { name, email, age, gender, weight, height, fitnessGoals, dietaryPreferences } = req.body
    const user = req.user?._id

    if (!name || !email || !age || !gender || !weight || !height || !fitnessGoals || !dietaryPreferences) {
        throw new ApiError(400, "All field are required")
    }

    const updatedUser = await User.findByIdAndUpdate(user,
        {
            $set: {
                name: name,
                email: email,
                age: age,
                gender: gender,
                weight: weight,
                height: height,
                fitnessGoals: fitnessGoals,
                dietaryPreferences: dietaryPreferences
            },
        },
        { new: true }
    ).select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(500, "Error while updating user")
    }

    return res.status(200).json(new ApiResponse(200, updatedUser, "user updated successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
    updateUserInfo
}