import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    workoutPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout"
    },
    date: {
        type: Date,
        required: true
    },
    exercises: {
        type: [
            {
                exercise: {
                    type: {
                        name: { type: String },
                        setsCompleted: { type: Number },
                        repsCompleted: { type: Number },
                        weightUsed: { type: Number } // in kg
                    }
                }
            }
        ]
    }

}, { timestamps: true })

export const Progress = mongoose.model('Progress', progressSchema);