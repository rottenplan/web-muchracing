import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceId: {
        type: String, // Optional: if we want to track specific devices
    },
    name: {
        type: String, // e.g. "Sentul Session 1"
    },
    originalFilename: {
        type: String,
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    trackId: {
        type: mongoose.Schema.Types.ObjectId, // Future use: link to a Track
        ref: 'Track',
    },
    sessionType: {
        type: String,
        enum: ['TRACK', 'DRAG'],
        default: 'TRACK',
    },
    stats: {
        totalDistance: Number, // km
        maxSpeed: Number,
        avgSpeed: Number,
        maxRpm: Number,
        totalTime: Number, // seconds
        lapCount: Number,
        bestLap: Number, // seconds
        // Drag Metrics
        time0to60: Number,
        time0to100: Number,
        time100to200: Number,
        time400m: Number,
    },
    laps: [{
        lapNumber: Number,
        lapTime: Number, // seconds
        pointIndex: Number, // Still kept for backward/metadata mapping
        S1: Number,
        S2: Number,
        S3: Number,
        valid: Boolean,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
