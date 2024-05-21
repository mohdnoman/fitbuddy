import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String, //hashed password
        required: [true, "password is required"],
    },
    profile: {
        type: String
    },
    age: {
        type: Number, //in years
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true
    },
    weight: {
        type: Number, //in kg
        min: 0,
        required: true
    },
    height: {
        type: Number, //in feets
        min: 0,
        required: true
    },
    fitnessGoals: {
        type: [String],
        required: true,
        default: ["muscle gain"]
    },
    dietaryPreferences: {
        type: [String],
        required: true,
        default: ["high protein"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { userId: this._id }, 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { userId: this._id }, 
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

export const User = mongoose.model('User', UserSchema);