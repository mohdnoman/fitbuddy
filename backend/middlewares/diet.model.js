import mongoose from "mongoose";

const dietSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user profile
        ref: "User",
        required: true
    },
    planName: {
        type: String,
        required: true,
        default: "My Workout Plan",
    },
    meals: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                },
                calories: {
                    type: Number,
                    required: true
                },
                proteins: {
                    type: Number,
                    required: true
                },
                carbohydrates: {
                    type: Number,
                    required: true
                },
                fats: {
                    type: Number,
                    required: true
                },
                ingredients: {
                    type: [String],
                    required: true
                }
            }
        ],
        required: true,

    },
    dietaryRestrictions: { // Array of dietary restrictions (e.g., "allergies", "intolerances")
        type: [String],
        required: true,
    }
},
    { timeseries: true });

export const Diet = mongoose.model('Diet', dietSchema)