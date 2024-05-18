import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        planName: {
            type: String,
            required: true
        },
        days: {
            type: [
                {
                    dayOfWeek: { type: String, required: true },
                    exercises: {
                        type: [
                            {
                                exerciseName: { type: String, required: true },
                                description: { type: String, required: true },
                                sets: { type: Number, required: true },
                                reps: { type: Number, required: true },
                                restPeriod: { type: Number, required: true } // in sec
                            }
                            // repeat for all the exercises
                        ]
                    }
                }
                // Repeat for all seven days of the week
            ],
            required: true
        }

    }
    , { timeseries: true });


export const Workout = mongoose.model("Workout", workoutSchema)