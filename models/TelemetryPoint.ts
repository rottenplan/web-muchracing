import mongoose from 'mongoose';

const TelemetryPointSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        index: true, // Crucial for performance
    },
    time: {
        type: Number, // Milliseconds since session start or absolute timestamp
        required: true,
    },
    lat: Number,
    lng: Number,
    speed: Number,
    rpm: Number,
    alt: Number,
    lean: Number,
    sats: Number,
    vbat: Number,
}, {
    timestamps: false,
    versionKey: false
});

// Create a compound index for efficient retrieval of points for a specific session
TelemetryPointSchema.index({ sessionId: 1, time: 1 });

export default mongoose.models.TelemetryPoint || mongoose.model('TelemetryPoint', TelemetryPointSchema);
