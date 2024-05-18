import mongoose from "mongoose";

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

export const User = mongoose.model('User', UserSchema)