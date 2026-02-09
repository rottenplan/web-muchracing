import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
    time: String,
    lat: Number,
    lng: Number,
    speed: Number, // km/h
    rpm: Number,
    alt: Number,   // Altitude if available
    lean: Number,  // Lean angle if available
}, { _id: false });

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
    stats: {
        totalDistance: Number, // km
        maxSpeed: Number,
        avgSpeed: Number,
        maxRpm: Number,
        totalTime: Number, // seconds
        lapCount: Number,
        bestLap: Number, // seconds
    },
    points: [PointSchema], // The telemetry data
    laps: [{
        lapNumber: Number,
        lapTime: Number, // seconds
        pointIndex: Number, // Index in the points array where this lap ENDS
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
